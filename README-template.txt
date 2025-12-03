================================================================================
                    COFFEE SHOP E-COMMERCE PROJECT
                    README FILE FOR EVALUATION
================================================================================

1. PROJECT BUILDING AND RUNNING INSTRUCTIONS
1.1. Prerequisites
------------------
- Node.js (v14 or higher)
- npm (v6 or higher)
- MongoDB (v4.4 or higher) - must be installed and running
- Git (for cloning the repository)

1.2. Installation Steps
------------------------
Step 1: Clone the repository (if applicable)
    git clone <repository-url>
    cd Final-pro

Step 2: Install Backend Dependencies
    cd backend
    npm install

Step 3: Install Frontend Dependencies
    cd frontend
    npm install

Step 4: Configure Environment Variables
    Create a .env file in the backend/ directory with the following content:
    
    # For local development, use:
    MONGODB_URI=mongodb://localhost:27017    
    DATABASE_NAME=CoffeeDB 
    PORT=3001
    NODE_ENV=development
  
    # Cloudinary Configuration (for image upload)
    CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
    CLOUDINARY_API_KEY=your-cloudinary-api-key
    CLOUDINARY_API_SECRET=your-cloudinary-api-secret

    # JWT Secret (use a strong random string)
    JWT_SECRET=your-jwt-secret-key

    # Email Configuration (SMTP)
    SMTP_HOST=smtp.gmail.com
    SMTP_PORT=587
    SMTP_SECURE=false           
    SMTP_USER=your-email@gmail.com
    SMTP_PASS=your-app-password
    FROM_EMAIL="Coffee Shop <your-email@gmail.com>"

    # Google OAuth Configuration (optional)
    GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
    GOOGLE_CLIENT_SECRET=your-google-client-secret
    GOOGLE_REDIRECT_URI=http://localhost:3001/api/auth/google/callback

    # Cho frontend
    CORS_ORIGINS=http://localhost:3000

    NOTE: For actual credentials, please refer to the README.txt file provided 
    separately (not included in repository for security reasons).

Step 5: Setup MongoDB Database
        Windows:
            - Ensure MongoDB service is running (check in Services: services.msc)
            - Or run: net start MongoDB
        
        Linux/Mac:
            - sudo systemctl start mongod
            - Or: mongod --dbpath /path/to/data
        
        Then update .env file:
            MONGODB_URI=mongodb://localhost:27017
            DATABASE_NAME=CoffeeDB

Step 6: Seed the Database (Load Sample Data)
    cd backend
    npm run seed
    -> This will populate the database with sample customers, products, orders, and reviews.

Step 7: Start Backend Server
    cd backend
    npm start
    -> The backend server will run on http://localhost:3001

Step 8: Start Frontend Application (in a new terminal)
    cd frontend
    npm start
    -> The frontend application will automatically open in your browser at http://localhost:3000

1.3. Verify Installation
-------------------------
- Backend Health Check: Open http://localhost:3001/health in your browser
  Expected response: {"status":"OK","mongodb":"Connected"}

- Frontend: Open http://localhost:3000 in your browser
  You should see the Coffee Shop homepage.

- MongoDB Connection:
  * For local MongoDB: Open MongoDB Compass and connect to:
    mongodb://localhost:27017
  * The database "CoffeeDB" will be created automatically when seed script runs.


2. URL AND SERVER LOGIN INFORMATION
================================================================================

2.1. Application URLs
---------------------
Frontend Application: http://localhost:3000
Backend API Server:   http://localhost:3001
MongoDB Connection:   mongodb://localhost:27017

2.2. API Endpoints
------------------
Base API URL: http://localhost:3001/api

Main Endpoints:
- Authentication:    /api/auth/login, /api/auth/register
- Products:          /api/products
- Orders:            /api/orders
- Customers:         /api/customers
- Account:           /api/account
- Health Check:      /health


3. USERNAMES AND PASSWORDS FOR PRE-LOADED ACCOUNTS
================================================================================

3.1. Admin Account (Full Access)
---------------------------------
Email:    admin@gmail.com
Password: admin@
Role:     Admin
Access:   Full access to admin panel, customer management, order management, 
          product management, dashboard, and analytics.

3.2. Customer Accounts (Sample Data)
-------------------------------------
After running the seed script (npm run seed), multiple customer accounts are 
created with sample data. All customer accounts use the default password:

Default Password: 123456

Sample Customer Accounts (from seed data):
- linh.ngo.1@example.com
- (Other customer emails can be found in backend/docs/customersList.json)

Note: If a customer account in the seed data does not have a password specified,
      the default password "123456" will be automatically assigned during seeding.

3.3. Creating New Accounts
---------------------------
You can also create new accounts through the registration page:
- Navigate to: http://localhost:3000/register
- Fill in the registration form
- New accounts will have "customer" role by default
- Admin role is automatically assigned to accounts with email "admin@gmail.com"


4. USING THE APPLICATION
================================================================================

4.1. Customer Features
----------------------
- Browse products by category
- View product details
- Add products to shopping cart
- Checkout and place orders
- View order history
- Manage account profile
- Loyalty points system (1 point = 1,000 VND)
- Use loyalty points for discounts during checkout

4.2. Admin Features
-------------------
- Access admin panel at: http://localhost:3000/admin
- Dashboard with analytics and reports
- Customer management (view, add, edit customer details)
- Product management (CRUD operations)
- Order management (view order details, update order status)
- Revenue and sales reports
- Advanced analytics

4.3. Navigation
---------------
- Home: http://localhost:3000/
- Products: Browse through product catalog
- Cart: View shopping cart
- Account: Manage user profile (requires login)
- Admin Panel: http://localhost:3000/admin (requires admin login)
- Contact: Contact information page

4.4. Important Notes
--------------------
- The application uses JWT (JSON Web Tokens) for authentication
- Session tokens expire after 7 days
- All passwords are hashed using bcrypt
- The loyalty points system: 1 loyalty point = 1,000 VND
- Orders earn 10% of order total as loyalty points (converted: orderTotal * 0.1 / 1000)
- Points can be used as discount during checkout (1 point = 1,000 VND discount)


5. OPTIONAL FEATURES IMPLEMENTED (BONUS POINTS)
================================================================================

5.1. CI/CD Pipeline (GitHub Actions)
-------------------------------------
- Implemented a full GitHub Actions workflow for automated testing and building
- Workflow file: .github/workflows/ci.yml
- Automatically runs on every push and pull request
- Includes:
  * Backend: Dependency installation, linting, build verification
  * Frontend: Dependency installation, linting, unit tests, build
  * Parallel execution for faster feedback
- Evidence: -See Bonus/CI-CD.md for detailed documentation
            -See Bonous/screenshot for successful evidence

5.2. Unit Testing
-----------------
- Implemented automated unit tests for frontend components
- Test file: frontend/src/components/NavBar/NavBar.test.jsx
- Tests are integrated into the CI/CD pipeline
- Can be run locally with: cd frontend && npm test
- Evidence: See Bonus/unit-test.md for detailed documentation

5.3. Advanced Features
----------------------
- Loyalty Program System with tier-based rewards
- Advanced Analytics Dashboard with charts and reports
- Customer Management System with detailed profiles
- Order Management with status tracking
- Product Management with image upload
- Responsive Design for mobile and desktop
- Google OAuth Integration (optional authentication method)


6. TROUBLESHOOTING
================================================================================

6.1. Common Issues
------------------
Issue: Backend server fails to start
Solution: 
  - Check if MongoDB is running
  - Verify PORT 3001 is not in use
  - Check .env file exists in backend/ directory
  - Verify all dependencies are installed (npm install)

Issue: Frontend fails to start
Solution:
  - Check if PORT 3000 is not in use
  - Verify all dependencies are installed (npm install)
  - Clear npm cache: npm cache clean --force
  - Delete node_modules and reinstall: rm -rf node_modules && npm install

Issue: Cannot connect to MongoDB
Solution:
  - Verify MongoDB service is running
  - Check MongoDB connection string in .env file
  - Try connecting with MongoDB Compass: mongodb://localhost:27017
  - Check MongoDB logs for errors

Issue: Login button is disabled
Solution:
  - Ensure email format is valid (e.g., user@example.com)
  - Password must be at least 6 characters
  - Check browser console for errors
  - Verify backend server is running

Issue: Seed script fails
Solution:
  - Ensure MongoDB is running and accessible
  - Check that all JSON files exist in backend/docs/
  - Verify file permissions
  - Check MongoDB connection string in .env

6.2. Database Reset
-------------------
To reset the database and reload sample data:
    cd backend
    npm run seed

This will delete all existing data and reload from JSON files in backend/docs/


7. PROJECT STRUCTURE
================================================================================

Final-pro/
├── backend/
│   ├── config/          # Configuration files (database, mailer)
│   ├── docs/            # Sample data JSON files
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── scripts/         # Utility scripts (seed.js)
│   ├── utils/           # Utility functions (loyalty.js)
│   ├── index.js         # Backend entry point
│   └── package.json     # Backend dependencies
│
├── frontend/
│   ├── public/          # Static files
│   ├── src/
│   │   ├── api/         # API client functions
│   │   ├── components/  # Reusable components
│   │   ├── contexts/    # React contexts (Auth, Cart)
│   │   ├── pages/       # Page components
│   │   │   ├── Admin/   # Admin panel pages
│   │   │   ├── Auth/    # Authentication pages
│   │   │   └── ...      # Other pages
│   │   ├── services/    # Service layer
│   │   ├── utils/       # Utility functions
│   │   └── App.jsx      # Main App component
│   └── package.json     # Frontend dependencies
│
├── .github/
│   └── workflows/
│       └── ci.yml       # CI/CD pipeline configuration
│
└── README-template.txt  # This template file (README.txt with actual credentials provided separately)


8. TECHNICAL STACK
================================================================================

Backend:
- Node.js
- Express.js
- MongoDB (with Mongoose)
- JWT (JSON Web Tokens)
- bcryptjs (password hashing)
- nodemailer (email functionality)
- Cloudinary (image upload)

Frontend:
- React 19
- React Router DOM
- Axios (HTTP client)
- Lucide React (icons)
- Recharts (charts and analytics)
- Styled Components
- TypeScript (partial)

Development Tools:
- GitHub Actions (CI/CD)
- Jest (testing)
- ESLint (code linting)


9. CONTACT AND SUPPORT
================================================================================

For any issues or questions during evaluation, please refer to:
- Backend README: backend/README.md
- Frontend README: frontend/README.md
- CI/CD Documentation: Bonus/CI-CD.md
- Unit Test Documentation: Bonus/unit-test.md

NOTE: The actual README.txt file with real credentials is provided separately 
      for evaluation purposes and is not included in this repository for security reasons.

