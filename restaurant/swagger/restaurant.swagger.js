/**
 * @swagger
 * components:
 *   schemas:
 *     Restaurant:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *           example: "Phở 24"
 *         description:
 *           type: string
 *           example: "Authentic Vietnamese Pho"
 *         ownerId:
 *           type: string
 *         address:
 *           type: object
 *           properties:
 *             street:
 *               type: string
 *             city:
 *               type: string
 *             district:
 *               type: string
 *             coordinates:
 *               $ref: '#/components/schemas/Location'
 *         phone:
 *           type: string
 *           example: "+84901234567"
 *         email:
 *           type: string
 *           format: email
 *         cuisineTypes:
 *           type: array
 *           items:
 *             type: string
 *           example: ["Vietnamese", "Asian"]
 *         rating:
 *           type: number
 *           format: float
 *           example: 4.5
 *         totalRatings:
 *           type: integer
 *           example: 120
 *         isOpen:
 *           type: boolean
 *           example: true
 *         openingHours:
 *           type: object
 *           properties:
 *             monday:
 *               $ref: '#/components/schemas/DayHours'
 *             tuesday:
 *               $ref: '#/components/schemas/DayHours'
 *             wednesday:
 *               $ref: '#/components/schemas/DayHours'
 *             thursday:
 *               $ref: '#/components/schemas/DayHours'
 *             friday:
 *               $ref: '#/components/schemas/DayHours'
 *             saturday:
 *               $ref: '#/components/schemas/DayHours'
 *             sunday:
 *               $ref: '#/components/schemas/DayHours'
 *         images:
 *           type: array
 *           items:
 *             type: string
 *             format: uri
 *         logo:
 *           type: string
 *           format: uri
 *         isActive:
 *           type: boolean
 *         isApproved:
 *           type: boolean
 *         deliveryFee:
 *           type: number
 *           example: 15000
 *         minOrderAmount:
 *           type: number
 *           example: 50000
 *         avgPrepTime:
 *           type: integer
 *           description: Average preparation time in minutes
 *           example: 30
 *         createdAt:
 *           type: string
 *           format: date-time
 * 
 *     DayHours:
 *       type: object
 *       properties:
 *         isOpen:
 *           type: boolean
 *         open:
 *           type: string
 *           example: "08:00"
 *         close:
 *           type: string
 *           example: "22:00"
 * 
 *     MenuItem:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         restaurantId:
 *           type: string
 *         name:
 *           type: string
 *           example: "Phở Bò Tái"
 *         description:
 *           type: string
 *           example: "Beef pho with rare steak"
 *         price:
 *           type: number
 *           example: 55000
 *         category:
 *           type: string
 *           example: "Main Dishes"
 *         image:
 *           type: string
 *           format: uri
 *         isAvailable:
 *           type: boolean
 *           example: true
 *         options:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/MenuOption'
 *         nutritionInfo:
 *           type: object
 *           properties:
 *             calories:
 *               type: integer
 *             protein:
 *               type: number
 *             carbs:
 *               type: number
 *             fat:
 *               type: number
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           example: ["spicy", "popular", "chef-recommended"]
 *         prepTime:
 *           type: integer
 *           description: Preparation time in minutes
 *           example: 15
 * 
 *     MenuOption:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "Extra beef"
 *         price:
 *           type: number
 *           example: 15000
 *         isRequired:
 *           type: boolean
 *           example: false
 * 
 *     Category:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *           example: "Main Dishes"
 *         restaurantId:
 *           type: string
 *         order:
 *           type: integer
 *           example: 1
 *         isActive:
 *           type: boolean
 * 
 *     Branch:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         restaurantId:
 *           type: string
 *         name:
 *           type: string
 *           example: "District 1 Branch"
 *         address:
 *           type: object
 *         phone:
 *           type: string
 *         managerId:
 *           type: string
 *         isActive:
 *           type: boolean
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
 *     CreateRestaurantRequest:
 *       type: object
 *       required:
 *         - name
 *         - address
 *         - phone
 *       properties:
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         address:
 *           type: object
 *           properties:
 *             street:
 *               type: string
 *             city:
 *               type: string
 *             district:
 *               type: string
 *             coordinates:
 *               $ref: '#/components/schemas/Location'
 *         phone:
 *           type: string
 *         email:
 *           type: string
 *         cuisineTypes:
 *           type: array
 *           items:
 *             type: string
 *         openingHours:
 *           type: object
 *         deliveryFee:
 *           type: number
 *         minOrderAmount:
 *           type: number
 * 
 *     CreateMenuItemRequest:
 *       type: object
 *       required:
 *         - name
 *         - price
 *         - category
 *       properties:
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         price:
 *           type: number
 *         category:
 *           type: string
 *         image:
 *           type: string
 *         options:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/MenuOption'
 *         isAvailable:
 *           type: boolean
 *           default: true
 */

/**
 * @swagger
 * tags:
 *   - name: Restaurants
 *     description: Restaurant management
 *   - name: Menu
 *     description: Menu items management
 *   - name: Categories
 *     description: Menu categories
 *   - name: Branches
 *     description: Restaurant branches
 */

/**
 * @swagger
 * /restaurants:
 *   get:
 *     summary: Get all restaurants
 *     tags: [Restaurants]
 *     security: []
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
 *         name: cuisine
 *         schema:
 *           type: string
 *         description: Filter by cuisine type
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name
 *       - in: query
 *         name: isOpen
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: lat
 *         schema:
 *           type: number
 *         description: User latitude for distance calculation
 *       - in: query
 *         name: lng
 *         schema:
 *           type: number
 *         description: User longitude for distance calculation
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *         description: Search radius in km
 *     responses:
 *       200:
 *         description: List of restaurants
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 restaurants:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Restaurant'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *   post:
 *     summary: Create new restaurant (Owner only)
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateRestaurantRequest'
 *     responses:
 *       201:
 *         description: Restaurant created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 restaurant:
 *                   $ref: '#/components/schemas/Restaurant'
 */

/**
 * @swagger
 * /restaurants/{id}:
 *   get:
 *     summary: Get restaurant by ID
 *     tags: [Restaurants]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Restaurant details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 restaurant:
 *                   $ref: '#/components/schemas/Restaurant'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *   put:
 *     summary: Update restaurant
 *     tags: [Restaurants]
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
 *             $ref: '#/components/schemas/CreateRestaurantRequest'
 *     responses:
 *       200:
 *         description: Restaurant updated
 *   delete:
 *     summary: Delete restaurant
 *     tags: [Restaurants]
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
 *         description: Restaurant deleted
 */

/**
 * @swagger
 * /restaurants/{id}/menu:
 *   get:
 *     summary: Get restaurant menu
 *     tags: [Menu]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: available
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Restaurant menu
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 menu:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MenuItem'
 *   post:
 *     summary: Add menu item
 *     tags: [Menu]
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
 *             $ref: '#/components/schemas/CreateMenuItemRequest'
 *     responses:
 *       201:
 *         description: Menu item added
 */

/**
 * @swagger
 * /restaurants/{id}/menu/{itemId}:
 *   get:
 *     summary: Get menu item details
 *     tags: [Menu]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Menu item details
 *   put:
 *     summary: Update menu item
 *     tags: [Menu]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateMenuItemRequest'
 *     responses:
 *       200:
 *         description: Menu item updated
 *   delete:
 *     summary: Delete menu item
 *     tags: [Menu]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Menu item deleted
 */

/**
 * @swagger
 * /restaurants/{id}/menu/{itemId}/availability:
 *   patch:
 *     summary: Toggle menu item availability
 *     tags: [Menu]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: itemId
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
 *               isAvailable:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Availability updated
 */

/**
 * @swagger
 * /restaurants/{id}/categories:
 *   get:
 *     summary: Get restaurant categories
 *     tags: [Categories]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 categories:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Category'
 *   post:
 *     summary: Create category
 *     tags: [Categories]
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
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               order:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Category created
 */

/**
 * @swagger
 * /restaurants/{id}/toggle-status:
 *   patch:
 *     summary: Toggle restaurant open/closed status
 *     tags: [Restaurants]
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
 *         description: Status toggled
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 isOpen:
 *                   type: boolean
 */

/**
 * @swagger
 * /restaurants/{id}/reviews:
 *   get:
 *     summary: Get restaurant reviews
 *     tags: [Restaurants]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Restaurant reviews
 *   post:
 *     summary: Add restaurant review
 *     tags: [Restaurants]
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
 *               - rating
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *               orderId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Review added
 */

/**
 * @swagger
 * /branch:
 *   get:
 *     summary: Get all branches
 *     tags: [Branches]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of branches
 *   post:
 *     summary: Create new branch
 *     tags: [Branches]
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
 *               - name
 *               - address
 *             properties:
 *               restaurantId:
 *                 type: string
 *               name:
 *                 type: string
 *               address:
 *                 type: object
 *               phone:
 *                 type: string
 *               managerId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Branch created
 */

export default {};
