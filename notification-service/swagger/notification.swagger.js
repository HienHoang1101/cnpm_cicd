/**
 * @swagger
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         userId:
 *           type: string
 *         title:
 *           type: string
 *           example: "Order Confirmed"
 *         body:
 *           type: string
 *           example: "Your order #ORD-2024-001234 has been confirmed"
 *         type:
 *           type: string
 *           enum: [order, payment, promotion, system, delivery]
 *           example: "order"
 *         data:
 *           type: object
 *           properties:
 *             orderId:
 *               type: string
 *             action:
 *               type: string
 *         isRead:
 *           type: boolean
 *           example: false
 *         createdAt:
 *           type: string
 *           format: date-time
 * 
 *     SendNotificationRequest:
 *       type: object
 *       required:
 *         - userId
 *         - title
 *         - body
 *       properties:
 *         userId:
 *           type: string
 *         title:
 *           type: string
 *         body:
 *           type: string
 *         type:
 *           type: string
 *           enum: [order, payment, promotion, system, delivery]
 *         data:
 *           type: object
 *         channels:
 *           type: array
 *           items:
 *             type: string
 *             enum: [push, email, sms]
 *           description: Notification channels to use
 * 
 *     BroadcastRequest:
 *       type: object
 *       required:
 *         - title
 *         - body
 *       properties:
 *         title:
 *           type: string
 *         body:
 *           type: string
 *         type:
 *           type: string
 *           enum: [promotion, system]
 *         targetRole:
 *           type: string
 *           enum: [customer, restaurant, delivery, all]
 *         data:
 *           type: object
 * 
 *     FCMToken:
 *       type: object
 *       required:
 *         - token
 *       properties:
 *         token:
 *           type: string
 *           description: Firebase Cloud Messaging token
 *         deviceType:
 *           type: string
 *           enum: [ios, android, web]
 */

/**
 * @swagger
 * tags:
 *   - name: Notifications
 *     description: Notification management
 *   - name: Push
 *     description: Push notification endpoints
 */

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Get user notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [order, payment, promotion, system, delivery]
 *       - in: query
 *         name: isRead
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: List of notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 notifications:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Notification'
 *                 unreadCount:
 *                   type: integer
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */

/**
 * @swagger
 * /notifications/send:
 *   post:
 *     summary: Send notification to user (Internal/Admin)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SendNotificationRequest'
 *     responses:
 *       200:
 *         description: Notification sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 notification:
 *                   $ref: '#/components/schemas/Notification'
 */

/**
 * @swagger
 * /notifications/broadcast:
 *   post:
 *     summary: Broadcast notification to multiple users (Admin only)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BroadcastRequest'
 *     responses:
 *       200:
 *         description: Broadcast sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 recipientCount:
 *                   type: integer
 */

/**
 * @swagger
 * /notifications/{id}/read:
 *   patch:
 *     summary: Mark notification as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification marked as read
 */

/**
 * @swagger
 * /notifications/read-all:
 *   patch:
 *     summary: Mark all notifications as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 updatedCount:
 *                   type: integer
 */

/**
 * @swagger
 * /notifications/{id}:
 *   delete:
 *     summary: Delete notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification deleted
 */

/**
 * @swagger
 * /notifications/fcm-token:
 *   post:
 *     summary: Register FCM token for push notifications
 *     tags: [Push]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FCMToken'
 *     responses:
 *       200:
 *         description: Token registered
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *   delete:
 *     summary: Remove FCM token
 *     tags: [Push]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token removed
 */

/**
 * @swagger
 * /notifications/preferences:
 *   get:
 *     summary: Get notification preferences
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notification preferences
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 preferences:
 *                   type: object
 *                   properties:
 *                     push:
 *                       type: boolean
 *                     email:
 *                       type: boolean
 *                     sms:
 *                       type: boolean
 *                     orderUpdates:
 *                       type: boolean
 *                     promotions:
 *                       type: boolean
 *   put:
 *     summary: Update notification preferences
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               push:
 *                 type: boolean
 *               email:
 *                 type: boolean
 *               sms:
 *                 type: boolean
 *               orderUpdates:
 *                 type: boolean
 *               promotions:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Preferences updated
 */

/**
 * @swagger
 * /notifications/unread-count:
 *   get:
 *     summary: Get unread notification count
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unread count
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 */

export default {};
