/**
 * @swagger
 * components:
 *   schemas:
 *     Payment:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         orderId:
 *           type: string
 *         userId:
 *           type: string
 *         amount:
 *           type: number
 *           example: 155000
 *         currency:
 *           type: string
 *           example: "VND"
 *         method:
 *           type: string
 *           enum: [cash, card, momo, zalopay, vnpay]
 *           example: "momo"
 *         status:
 *           type: string
 *           enum: [pending, processing, completed, failed, refunded, cancelled]
 *           example: "completed"
 *         transactionId:
 *           type: string
 *           description: External payment gateway transaction ID
 *         metadata:
 *           type: object
 *           description: Additional payment data from gateway
 *         refundAmount:
 *           type: number
 *           example: 0
 *         refundReason:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 * 
 *     CreatePaymentRequest:
 *       type: object
 *       required:
 *         - orderId
 *         - amount
 *         - method
 *       properties:
 *         orderId:
 *           type: string
 *           description: Order ID to pay for
 *         amount:
 *           type: number
 *           description: Payment amount
 *         method:
 *           type: string
 *           enum: [cash, card, momo, zalopay, vnpay]
 *         returnUrl:
 *           type: string
 *           format: uri
 *           description: URL to redirect after payment (for online payments)
 *         cancelUrl:
 *           type: string
 *           format: uri
 * 
 *     PaymentResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         payment:
 *           $ref: '#/components/schemas/Payment'
 *         paymentUrl:
 *           type: string
 *           format: uri
 *           description: URL to payment gateway (for online payments)
 *         qrCode:
 *           type: string
 *           description: QR code data for mobile payments
 * 
 *     RefundRequest:
 *       type: object
 *       required:
 *         - reason
 *       properties:
 *         amount:
 *           type: number
 *           description: Refund amount (defaults to full amount)
 *         reason:
 *           type: string
 *           description: Reason for refund
 * 
 *     WebhookPayload:
 *       type: object
 *       properties:
 *         transactionId:
 *           type: string
 *         orderId:
 *           type: string
 *         status:
 *           type: string
 *         amount:
 *           type: number
 *         signature:
 *           type: string
 *           description: HMAC signature for verification
 */

/**
 * @swagger
 * tags:
 *   - name: Payments
 *     description: Payment processing endpoints
 *   - name: Refunds
 *     description: Refund management
 *   - name: Webhooks
 *     description: Payment gateway webhooks
 */

/**
 * @swagger
 * /payment:
 *   post:
 *     summary: Create a new payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePaymentRequest'
 *     responses:
 *       201:
 *         description: Payment created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaymentResponse'
 *       400:
 *         description: Invalid request
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /payment/{id}:
 *   get:
 *     summary: Get payment by ID
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Payment ID
 *     responses:
 *       200:
 *         description: Payment details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 payment:
 *                   $ref: '#/components/schemas/Payment'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

/**
 * @swagger
 * /payment/order/{orderId}:
 *   get:
 *     summary: Get payment by order ID
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment for order
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 payment:
 *                   $ref: '#/components/schemas/Payment'
 */

/**
 * @swagger
 * /payment/{id}/status:
 *   get:
 *     summary: Check payment status
 *     tags: [Payments]
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
 *         description: Payment status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 status:
 *                   type: string
 *                   enum: [pending, processing, completed, failed, refunded, cancelled]
 *                 payment:
 *                   $ref: '#/components/schemas/Payment'
 */

/**
 * @swagger
 * /payment/{id}/confirm:
 *   post:
 *     summary: Confirm cash payment
 *     tags: [Payments]
 *     description: Used by delivery person to confirm cash payment received
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
 *         description: Payment confirmed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 payment:
 *                   $ref: '#/components/schemas/Payment'
 */

/**
 * @swagger
 * /payment/{id}/refund:
 *   post:
 *     summary: Refund payment
 *     tags: [Refunds]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefundRequest'
 *     responses:
 *       200:
 *         description: Refund processed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 refundAmount:
 *                   type: number
 *                 payment:
 *                   $ref: '#/components/schemas/Payment'
 *       400:
 *         description: Cannot refund this payment
 */

/**
 * @swagger
 * /payment/webhook:
 *   post:
 *     summary: Payment gateway webhook
 *     tags: [Webhooks]
 *     security: []
 *     description: |
 *       Webhook endpoint for payment gateways to send payment status updates.
 *       The request body format depends on the payment gateway.
 *       
 *       **Supported gateways:**
 *       - MoMo
 *       - ZaloPay
 *       - VNPay
 *       - Stripe
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WebhookPayload'
 *     responses:
 *       200:
 *         description: Webhook processed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *       400:
 *         description: Invalid signature or payload
 */

/**
 * @swagger
 * /payment/callback:
 *   get:
 *     summary: Payment callback URL
 *     tags: [Webhooks]
 *     security: []
 *     description: Callback URL for payment gateway redirects after payment
 *     parameters:
 *       - in: query
 *         name: orderId
 *         schema:
 *           type: string
 *       - in: query
 *         name: transactionId
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: signature
 *         schema:
 *           type: string
 *     responses:
 *       302:
 *         description: Redirect to frontend with payment result
 */

/**
 * @swagger
 * /payment/methods:
 *   get:
 *     summary: Get available payment methods
 *     tags: [Payments]
 *     security: []
 *     responses:
 *       200:
 *         description: List of payment methods
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 methods:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "momo"
 *                       name:
 *                         type: string
 *                         example: "MoMo Wallet"
 *                       icon:
 *                         type: string
 *                         format: uri
 *                       isEnabled:
 *                         type: boolean
 */

/**
 * @swagger
 * /payment/history:
 *   get:
 *     summary: Get user payment history
 *     tags: [Payments]
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
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, completed, failed, refunded]
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Payment history
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 payments:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Payment'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */

export default {};
