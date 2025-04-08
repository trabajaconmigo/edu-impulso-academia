edu-impulso-academia/
├─ src/
│   └─ app/
│       ├─ layout.tsx                // Root layout (global header, footer, etc.)
│       ├─ globals.css               // Global CSS, resets, and variables
│       ├─ page.tsx                  // Home Page ("/")
│       ├─ cursos/                   // Courses Module
│       │   ├─ page.tsx              // Courses Listing Page ("/cursos")
│       │   └─ [slug]/               // Dynamic course routes ("/cursos/:slug")
│       │       ├─ page.tsx          // Course Detail Page ("/cursos/:slug")
│       │       └─ contenido/         // Course Content Module
│       │           ├─ page.tsx      // Course Content ("/cursos/:slug/contenido")
│       │           └─ examen/        // Exams for course sections
│       │               └─ [sectionId]/
│       │                     └─ page.tsx  // Exam Page ("/cursos/:slug/contenido/examen/:sectionId")
│       ├─ concejos/                 // Blog Module ("Concejos")
│       │   ├─ page.tsx              // Blog Listing ("/concejos")
│       │   └─ [slug]/               // Individual Blog Post ("/concejos/:slug")
│       │         └─ page.tsx
│       ├─ auth/                     // Authentication Pages
│       │   ├─ login/
│       │   │   └─ page.tsx          // Login Page ("/auth/login")
│       │   └─ registro/
│       │         └─ page.tsx       // Registration Page ("/auth/registro")
│       ├─ perfil/                   // User Profile Page ("/perfil")
│       │      └─ page.tsx
│       ├─ checkout/                 // Checkout Module
│       │   ├─ page.tsx              // Checkout Page ("/checkout")
│       │   ├─ CheckoutForm.tsx      // Card Payment Form Component
│       │   └─ OxxoPaymentForm.tsx   // OXXO Payment Form Component
│       └─ api/                      // API Endpoints
│           ├─ stripe-webhook/
│           │   └─ route.ts          // Stripe Webhook Endpoint (listens for events)
│           ├─ create-payment-intent-oxxo/
│           │   └─ route.ts          // Creates PaymentIntent for OXXO payments
│           └─ save-purchase/
│               └─ route.ts          // (Optional) API to save purchase data manually
├─ .eslintrc.json
├─ .gitignore
├─ package.json
├─ tsconfig.json
└─ ... (other config files)


SUPABASE DATABASE
├─ auth.users               // Managed by Supabase for authentication
│
├─ profiles                 // Additional user info
│    └── (user_id, full_name, discount_points, created_at)
│
├─ purchases                // User purchases for courses
│    └── (user_id, course_id, payment_id, amount, purchased_at, status)
│
├─ courses                  // Course details (promo video, slug, title, description, price, etc.)
│    ├─ course_sections     // Sections within each course
│    │     └── lessons      // Lessons in each section
│    │             └── exams
│    │                    └── exam_questions  // (Optional) Exam questions for each exam
│    └── (course details)
│
├─ user_exam_attempts       // Tracks exam attempts by users, linking users and exams
│
├─ coupons                  // Discount codes/coupons
│
└─ blog_posts               // Blog posts for SEO and content marketing
     └── (slug, title, content, published_at, author_id → profiles/users)
