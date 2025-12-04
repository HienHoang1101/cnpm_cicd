/**
 * @swagger
 * components:
 *   schemas:
 *     Order:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *         orderNumber:
 *           type: string
 *           example: "ORD-2024-001234"
 *         customer:
 *           type: object
 *           properties:
 *             userId:
 *               type: string
 *             name:
 *               type: string
 *             email:
 *               type: string
 *             phone:
 *               type: string
 *         restaurant:
 *           type: object
 *           properties:
 *             restaurantId:
 *               type: string
 *             name:
 *               type: string
 *             address:
 *               type: string
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderItem'
 *         status:
 *           type: string
 *           enum: [pending, confirmed, preparing, ready, picked_up, on_the_way, delivered, cancelled]
 *           example: "pending"
 *         paymentStatus:
 *           type: string
 *           enum: [pending, paid, failed, refunded]
 *           example: "pending"
 *         paymentMethod:
 *           type: string
 *           enum: [cash, card, momo, zalopay]
 *           example: "cash"
 *         deliveryAddress:
 *           $ref: '#/components/schemas/DeliveryAddress'
 *         deliveryPerson:
 *           type: object
 *           properties:
 *             userId:
 *               type: string
 *             name:
 *               type: string
 *             phone:
 *               type: string
 *             currentLocation:
 *               $ref: '#/components/schemas/Location'
 *         subtotal:
 *           type: number
 *           example: 150000
 *         deliveryFee:
 *           type: number
 *           example: 15000
 *         discount:
 *           type: number
 *           example: 10000
 *         total:
 *           type: number
 *           example: 155000
 *         estimatedDeliveryTime:
 *           type: string
 *           format: date-time
 *         notes:
 *           type: string
 *           example: "Extra spicy please"
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 * 
 *     OrderItem:
 *       type: object
 *       properties:
 *         menuItemId:
 *           type: string
 *         name:
 *           type: string
 *           example: "Phở Bò"
 *         quantity:
 *           type: integer
 *           example: 2
 *         price:
 *           type: number
 *           example: 50000
 *         options:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *         total:
 *           type: number
 *           example: 100000
 * 
 *     DeliveryAddress:
 *       type: object
 *       properties:
 *         street:
 *           type: string
 *           example: "123 Nguyen Hue"
 *         city:
 *           type: string
 *           example: "Ho Chi Minh City"
 *         district:
 *           type: string
 *           example: "District 1"
 *         coordinates:
 *           $ref: '#/components/schemas/Location'
 * 
 *     Location:
 *       type: object
 *       properties:
 *         lat:
 *           type: number
 *           example: 10.8231
 *         lng:
 *           type: number
 *           example: 106.6297
 * 
 *     Cart:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         userId:
 *           type: string
 *         restaurantId:
 *           type: string
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CartItem'
 *         total:
 *           type: number
 *         createdAt:
 *           type: string
 *           format: date-time
 * 
 *     CartItem:
 *       type: object
 *       properties:
 *         menuItemId:
 *           type: string
 *         name:
 *           type: string
 *         quantity:
 *           type: integer
 *         price:
 *           type: number
 *         options:
 *           type: array
 *           items:
 *             type: object
 * 
 *     CreateOrderRequest:
 *       type: object
 *       required:
 *         - restaurantId
 *         - items
 *         - deliveryAddress
 *         - paymentMethod
 *       properties:
 *         restaurantId:
 *           type: string
 *         items:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               menuItemId:
 *                 type: string
 *               quantity:
 *                 type: integer
 *               options:
 *                 type: array
 *                 items:
 *                   type: string
 *         deliveryAddress:
 *           $ref: '#/components/schemas/DeliveryAddress'
 *         paymentMethod:
 *           type: string
 *           enum: [cash, card, momo, zalopay]
 *         couponCode:
 *           type: string
 *         notes:
 *           type: string
 * 
 *     UpdateOrderStatusRequest:
 *       type: object
 *       required:
 *         - status
 *       properties:
 *         status:
 *           type: string
 *           enum: [pending, confirmed, preparing, ready, picked_up, on_the_way, delivered, cancelled]
 *         reason:
 *           type: string
 *           description: Required when cancelling order
 */

/**
 * @swagger
 * tags:
 *   - name: Orders
 *     description: Order management endpoints
 *   - name: Cart
 *     description: Shopping cart endpoints
 *   - name: Tracking
 *     description: Order tracking endpoints
 */

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateOrderRequest'
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 order:
 *                   $ref: '#/components/schemas/Order'
 *       400:
 *         description: Validation error
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *   get:
 *     summary: Get current user's orders
 *     tags: [Orders]
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
 *           enum: [pending, confirmed, preparing, ready, picked_up, on_the_way, delivered, cancelled]
 *     responses:
 *       200:
 *         description: List of orders
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 orders:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Order'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Get order by ID
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 order:
 *                   $ref: '#/components/schemas/Order'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *   delete:
 *     summary: Cancel/Delete order
 *     tags: [Orders]
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
 *         description: Order cancelled successfully
 *       400:
 *         description: Cannot cancel order in current status
 */

/**
 * @swagger
 * /orders/{id}/status:
 *   patch:
 *     summary: Update order status
 *     tags: [Orders]
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
 *             $ref: '#/components/schemas/UpdateOrderStatusRequest'
 *     responses:
 *       200:
 *         description: Status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 order:
 *                   $ref: '#/components/schemas/Order'
 */

/**
 * @swagger
 * /orders/{id}/tracking:
 *   get:
 *     summary: Get order tracking information
 *     tags: [Tracking]
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
 *         description: Tracking information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 tracking:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                     deliveryPerson:
 *                       type: object
 *                     currentLocation:
 *                       $ref: '#/components/schemas/Location'
 *                     estimatedArrival:
 *                       type: string
 *                       format: date-time
 *                     statusHistory:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           status:
 *                             type: string
 *                           timestamp:
 *                             type: string
 *                             format: date-time
 */

/**
 * @swagger
 * /orders/{id}/delivery-person:
 *   patch:
 *     summary: Assign delivery person to order
 *     tags: [Orders]
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
 *             type: object
 *             required:
 *               - deliveryPersonId
 *             properties:
 *               deliveryPersonId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Delivery person assigned
 */

/**
 * @swagger
 * /orders/{id}/delivery-location:
 *   patch:
 *     summary: Update delivery person location
 *     tags: [Tracking]
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
 *             $ref: '#/components/schemas/Location'
 *     responses:
 *       200:
 *         description: Location updated
 */

/**
 * @swagger
 * /orders/restaurant:
 *   post:
 *     summary: Get restaurant orders (Restaurant only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               restaurantId:
 *                 type: string
 *               status:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Restaurant orders
 */

/**
 * @swagger
 * /orders/admin/all:
 *   get:
 *     summary: Get all orders (Admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
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
 *         description: All orders with pagination
 */

/**
 * @swagger
 * /orders/{orderId}/payment:
 *   patch:
 *     summary: Update order payment info
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               paymentId:
 *                 type: string
 *               paymentMethod:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment updated
 */

/**
 * @swagger
 * /orders/{orderId}/payment/status:
 *   patch:
 *     summary: Update payment status (webhook)
 *     tags: [Orders]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - paymentStatus
 *             properties:
 *               paymentStatus:
 *                 type: string
 *                 enum: [pending, paid, failed, refunded]
 *     responses:
 *       200:
 *         description: Payment status updated
 */

/**
 * @swagger
 * /cart:
 *   get:
 *     summary: Get user's cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart contents
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 cart:
 *                   $ref: '#/components/schemas/Cart'
 *   post:
 *     summary: Add item to cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - restaurantId
 *               - menuItemId
 *               - quantity
 *             properties:
 *               restaurantId:
 *                 type: string
 *               menuItemId:
 *                 type: string
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *               options:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Item added to cart
 *   delete:
 *     summary: Clear cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart cleared
 */

export default {};
