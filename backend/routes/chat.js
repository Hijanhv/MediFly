const express = require("express");
const { createOpenAI } = require("@ai-sdk/openai");
const {
  streamText,
  tool,
  convertToModelMessages,
  jsonSchema,
  stepCountIs,
} = require("ai");

// Initialize OpenAI provider
const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
const { eq, desc, and, sql } = require("drizzle-orm");
const { v4: uuidv4 } = require("uuid");
const db = require("../db");
const {
  chatSessions,
  chatMessages,
  deliveries,
  hospitals,
  villages,
  medicineTypes,
  cities,
  drones,
} = require("../db/schema");

const router = express.Router();

// Helper function to get or create chat session
async function getOrCreateSession(sessionToken, userId = null) {
  if (sessionToken) {
    const existingSession = await db
      .select()
      .from(chatSessions)
      .where(eq(chatSessions.sessionToken, sessionToken))
      .limit(1);

    if (existingSession.length > 0) {
      return existingSession[0];
    }
  }

  const newSessionToken = uuidv4();
  const newSession = await db
    .insert(chatSessions)
    .values({
      userId,
      sessionToken: newSessionToken,
    })
    .returning();

  return newSession[0];
}

// Define tools for the AI agent
const getUserOrdersTool = tool({
  description: "Get the order history for a specific user",
  inputSchema: jsonSchema({
    type: "object",
    properties: {
      userId: {
        type: "number",
        description: "The ID of the user to get orders for",
      },
      limit: {
        type: "number",
        description: "Maximum number of orders to return",
        default: 10,
      },
    },
    required: ["userId"],
  }),
  execute: async ({ userId, limit = 10 }) => {
    try {
      const userOrders = await db
        .select({
          id: deliveries.id,
          status: deliveries.status,
          priority: deliveries.priority,
          distanceKm: deliveries.distanceKm,
          etaMinutes: deliveries.etaMinutes,
          estimatedArrival: deliveries.estimatedArrival,
          actualArrival: deliveries.actualArrival,
          notes: deliveries.notes,
          createdAt: deliveries.createdAt,
          updatedAt: deliveries.updatedAt,
          hospitalName: hospitals.name,
          hospitalAddress: hospitals.address,
          villageName: villages.name,
          medicineType: medicineTypes.name,
          medicineDescription: medicineTypes.description,
          medicineIcon: medicineTypes.icon,
        })
        .from(deliveries)
        .leftJoin(hospitals, eq(deliveries.hospitalId, hospitals.id))
        .leftJoin(villages, eq(deliveries.villageId, villages.id))
        .leftJoin(
          medicineTypes,
          eq(deliveries.medicineTypeId, medicineTypes.id)
        )
        .where(eq(deliveries.userId, userId))
        .orderBy(desc(deliveries.createdAt))
        .limit(limit);

      return {
        success: true,
        orders: userOrders,
        count: userOrders.length,
      };
    } catch (error) {
      console.error("Error getting user orders:", error);
      return {
        success: false,
        error: "Failed to retrieve user orders",
      };
    }
  },
});

const getOrderDetailsTool = tool({
  description: "Get detailed information about a specific order",
  inputSchema: jsonSchema({
    type: "object",
    properties: {
      orderId: {
        type: "number",
        description: "The ID of the order to get details for",
      },
      userId: {
        type: "number",
        description: "The ID of the user making the request (for security)",
      },
    },
    required: ["orderId", "userId"],
  }),
  execute: async ({ orderId, userId }) => {
    try {
      const orderDetails = await db
        .select({
          id: deliveries.id,
          status: deliveries.status,
          priority: deliveries.priority,
          distanceKm: deliveries.distanceKm,
          etaMinutes: deliveries.etaMinutes,
          estimatedArrival: deliveries.estimatedArrival,
          actualArrival: deliveries.actualArrival,
          notes: deliveries.notes,
          createdAt: deliveries.createdAt,
          updatedAt: deliveries.updatedAt,
          hospitalName: hospitals.name,
          hospitalAddress: hospitals.address,
          hospitalContact: hospitals.contactNumber,
          villageName: villages.name,
          medicineType: medicineTypes.name,
          medicineDescription: medicineTypes.description,
          medicineIcon: medicineTypes.icon,
          requiresRefrigeration: medicineTypes.requiresRefrigeration,
          droneName: drones.name,
          droneModel: drones.model,
          droneBatteryLevel: drones.batteryLevel,
        })
        .from(deliveries)
        .leftJoin(hospitals, eq(deliveries.hospitalId, hospitals.id))
        .leftJoin(villages, eq(deliveries.villageId, villages.id))
        .leftJoin(
          medicineTypes,
          eq(deliveries.medicineTypeId, medicineTypes.id)
        )
        .leftJoin(drones, eq(deliveries.droneId, drones.id))
        .where(and(eq(deliveries.id, orderId), eq(deliveries.userId, userId)))
        .limit(1);

      if (orderDetails.length === 0) {
        return {
          success: false,
          error: "Order not found or access denied",
        };
      }

      return {
        success: true,
        order: orderDetails[0],
      };
    } catch (error) {
      console.error("Error getting order details:", error);
      return {
        success: false,
        error: "Failed to retrieve order details",
      };
    }
  },
});

const getMedicineInfoTool = tool({
  description: "Get information about available medicine types",
  inputSchema: jsonSchema({
    type: "object",
    properties: {
      medicineName: {
        type: "string",
        description: "Name of the medicine to search for (optional)",
      },
    },
    required: [],
  }),
  execute: async ({ medicineName }) => {
    try {
      let query = db.select().from(medicineTypes);

      if (medicineName) {
        query = query.where(
          sql`${medicineTypes.name} ILIKE ${`%${medicineName}%`}`
        );
      }

      const medicines = await query.orderBy(medicineTypes.name).limit(20);

      return {
        success: true,
        medicines,
        count: medicines.length,
      };
    } catch (error) {
      console.error("Error getting medicine info:", error);
      return {
        success: false,
        error: "Failed to retrieve medicine information",
      };
    }
  },
});

const getHospitalInfoTool = tool({
  description: "Get information about hospitals in the system",
  inputSchema: jsonSchema({
    type: "object",
    properties: {
      hospitalName: {
        type: "string",
        description: "Name of the hospital to search for (optional)",
      },
      cityId: {
        type: "number",
        description: "Filter hospitals by city ID (optional)",
      },
    },
    required: [],
  }),
  execute: async ({ hospitalName, cityId }) => {
    try {
      let query = db
        .select({
          id: hospitals.id,
          name: hospitals.name,
          address: hospitals.address,
          contactNumber: hospitals.contactNumber,
          pincode: hospitals.pincode,
          latitude: hospitals.latitude,
          longitude: hospitals.longitude,
          cityName: cities.name,
        })
        .from(hospitals)
        .leftJoin(cities, eq(hospitals.cityId, cities.id));

      if (hospitalName) {
        query = query.where(
          sql`${hospitals.name} ILIKE ${`%${hospitalName}%`}`
        );
      }

      if (cityId) {
        query = query.where(eq(hospitals.cityId, cityId));
      }

      const hospitalsList = await query.orderBy(hospitals.name).limit(20);

      return {
        success: true,
        hospitals: hospitalsList,
        count: hospitalsList.length,
      };
    } catch (error) {
      console.error("Error getting hospital info:", error);
      return {
        success: false,
        error: "Failed to retrieve hospital information",
      };
    }
  },
});

const getDeliveryStatsTool = tool({
  description: "Get delivery statistics for a user",
  inputSchema: jsonSchema({
    type: "object",
    properties: {
      userId: {
        type: "number",
        description: "The ID of the user to get stats for",
      },
    },
    required: ["userId"],
  }),
  execute: async ({ userId }) => {
    try {
      const stats = await db
        .select({
          totalOrders: sql`COUNT(*)`.mapWith(Number),
          pendingOrders:
            sql`COUNT(CASE WHEN ${deliveries.status} = 'pending' THEN 1 END)`.mapWith(
              Number
            ),
          inTransitOrders:
            sql`COUNT(CASE WHEN ${deliveries.status} = 'in-transit' THEN 1 END)`.mapWith(
              Number
            ),
          deliveredOrders:
            sql`COUNT(CASE WHEN ${deliveries.status} = 'delivered' THEN 1 END)`.mapWith(
              Number
            ),
          cancelledOrders:
            sql`COUNT(CASE WHEN ${deliveries.status} = 'cancelled' THEN 1 END)`.mapWith(
              Number
            ),
          emergencyOrders:
            sql`COUNT(CASE WHEN ${deliveries.priority} = 'emergency' THEN 1 END)`.mapWith(
              Number
            ),
        })
        .from(deliveries)
        .where(eq(deliveries.userId, userId));

      return {
        success: true,
        stats: stats[0] || {},
      };
    } catch (error) {
      console.error("Error getting delivery stats:", error);
      return {
        success: false,
        error: "Failed to retrieve delivery statistics",
      };
    }
  },
});

// POST /api/chat - Main chat endpoint with AI agent
router.post("/", async (req, res) => {
  try {
    console.log("Received request body:", JSON.stringify(req.body, null, 2));
    const { messages, sessionToken, userId } = req.body;

    if (!messages || messages.length === 0) {
      console.error("Messages missing or empty:", messages);
      return res.status(400).json({ error: "Messages are required" });
    }

    // Get or create chat session
    const session = await getOrCreateSession(sessionToken, userId);

    // Get the latest user message
    const latestMessage = messages[messages.length - 1];
    if (latestMessage.role !== "user") {
      return res.status(400).json({ error: "Last message must be from user" });
    }

    // Store user message in database
    await db.insert(chatMessages).values({
      sessionId: session.id,
      role: "user",
      content: latestMessage.content || JSON.stringify(latestMessage.parts),
    });

    // Get chat history for context

    // Prepare tools based on user authentication
    const availableTools = {};

    if (userId) {
      // Create user-specific versions of the tools that automatically include the userId
      availableTools.getUserOrders = tool({
        description: `Get the order history for the current user (ID: ${userId})`,
        inputSchema: jsonSchema({
          type: "object",
          properties: {
            limit: {
              type: "number",
              description: "Maximum number of orders to return",
              default: 10,
            },
          },
          required: [],
        }),
        execute: async ({ limit = 10 }) => {
          return getUserOrdersTool.execute({ userId, limit });
        },
      });

      availableTools.getOrderDetails = tool({
        description: `Get detailed information about a specific order for the current user (ID: ${userId})`,
        inputSchema: jsonSchema({
          type: "object",
          properties: {
            orderId: {
              type: "number",
              description: "The ID of the order to get details for",
            },
          },
          required: ["orderId"],
        }),
        execute: async ({ orderId }) => {
          return getOrderDetailsTool.execute({ orderId, userId });
        },
      });

      availableTools.getDeliveryStats = tool({
        description: `Get delivery statistics for the current user (ID: ${userId})`,
        inputSchema: jsonSchema({
          type: "object",
          properties: {},
          required: [],
        }),
        execute: async () => {
          return getDeliveryStatsTool.execute({ userId });
        },
      });
    }

    // Always available tools
    availableTools.getMedicineInfo = getMedicineInfoTool;
    availableTools.getHospitalInfo = getHospitalInfoTool;

    // Convert messages to AI SDK v5 UIMessage format
    const uiMessages = messages.map((msg) => {
      // If message already has parts, use it as is
      if (msg.parts) {
        return msg;
      }
      // Otherwise convert content to parts format
      return {
        ...msg,
        id: msg.id || `msg-${Date.now()}-${Math.random()}`,
        parts: msg.content
          ? [{ type: "text", text: msg.content }]
          : [{ type: "text", text: "" }],
      };
    });

    const systemMessage = {
      role: "system",
      content: `You are a helpful customer care assistant for MediFly, a drone delivery service for medical supplies. You have access to tools that can help you provide accurate information about orders, deliveries, and services.

Your capabilities:
- Check user order history and status
- Get detailed information about specific orders
- Provide information about medicine types
- Share hospital information
- Calculate delivery statistics

Guidelines:
1. Be friendly, professional, and empathetic
2. Use the available tools to get accurate information before answering
3. For user-specific queries, the userId (${
        userId || "unknown"
      }) is automatically included in the tools
4. If you don't have access to information, be honest and offer to connect them with human support
5. Keep responses concise but helpful
6. Always prioritize customer safety and satisfaction
7. For order tracking, use the order details tool to provide real-time status
8. IMPORTANT: After using any tool, ALWAYS generate a text response explaining the results in a friendly, conversational way
9. Never finish your response immediately after calling a tool - always provide a natural language summary of what you found

Current date: ${new Date().toLocaleDateString()}

IMPORTANT: The current user ID is ${
        userId || "unknown"
      }. When users ask about "my orders" or "my deliveries", use this user ID with the available tools.`,
    };

    // Convert messages to model format
    const modelMessages = convertToModelMessages(uiMessages);

    // Generate AI response with tools
    const result = streamText({
      model: openai("gpt-4o"),
      system: systemMessage.content,
      messages: modelMessages,
      tools: availableTools,
      temperature: 0.7,
      maxTokens: 1000,
      // In AI SDK v5, we need to set stopWhen to allow continuation after tool execution
      stopWhen: stepCountIs(5),
      onFinish: async ({ text, finishReason, usage, steps }) => {
        console.log("Generated text:", text);
        console.log("Finish reason:", finishReason);
        console.log("Token usage:", usage);
        console.log("Steps taken:", steps?.length || 0);
        try {
          console.log("Finish reason:", finishReason);
          console.log("Token usage:", usage);
          console.log("Steps taken:", steps?.length || 0);

          // Store assistant message
          await db.insert(chatMessages).values({
            sessionId: session.id,
            role: "assistant",
            content: text,
          });
        } catch (error) {
          console.error("Error storing assistant message:", error);
        }
      },
    });

    // Set response headers for streaming
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Session-Token", session.sessionToken);

    // Pipe UI message stream to response (includes tool calls and results)
    return result.pipeUIMessageStreamToResponse(res);
  } catch (error) {
    console.error("Chat API error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/chat/history - Get chat history for a session
router.get("/history", async (req, res) => {
  try {
    const { sessionToken } = req.query;

    if (!sessionToken) {
      return res.status(400).json({ error: "Session token is required" });
    }

    const session = await db
      .select()
      .from(chatSessions)
      .where(eq(chatSessions.sessionToken, sessionToken))
      .limit(1);

    if (session.length === 0) {
      return res.status(404).json({ error: "Session not found" });
    }

    const history = await db
      .select({
        id: chatMessages.id,
        role: chatMessages.role,
        content: chatMessages.content,
        createdAt: chatMessages.createdAt,
      })
      .from(chatMessages)
      .where(eq(chatMessages.sessionId, session[0].id))
      .orderBy(chatMessages.createdAt);

    res.json({
      sessionToken,
      messages: history,
    });
  } catch (error) {
    console.error("Chat history error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
