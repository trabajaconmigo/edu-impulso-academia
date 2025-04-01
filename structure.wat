edu-impulso-academia/
├─ src/
│   └─ app/
│       ├─ layout.tsx            // Root layout (global header, footer, etc.)
│       ├─ globals.css           // Global CSS/reset and variables
│       ├─ page.tsx              // Home Page ("/")
│       ├─ cursos/               // Courses Module
│       │   ├─ page.tsx          // Courses Listing Page ("/cursos")
│       │   └─ [slug]/           // Dynamic course routes ("/cursos/:slug")
│       │       ├─ page.tsx      // Course Detail Page ("/cursos/:slug")
│       │       └─ contenido/     // Course Content Module
│       │           ├─ page.tsx  // Course Content ("/cursos/:slug/contenido")
│       │           └─ examen/    // Exams for course sections
│       │               └─ [sectionId]/
│       │                     └─ page.tsx  // Exam Page ("/cursos/:slug/contenido/examen/:sectionId")
│       ├─ concejos/             // Blog Module ("Concejos")
│       │   ├─ page.tsx          // Blog Listing ("/concejos")
│       │   └─ [slug]/           // Individual Blog Post ("/concejos/:slug")
│       │         └─ page.tsx
│       ├─ auth/                 // Authentication Pages
│       │   ├─ login/
│       │   │   └─ page.tsx      // Login Page ("/auth/login")
│       │   └─ registro/
│       │         └─ page.tsx   // Registration Page ("/auth/registro")
│       └─ perfil/               // User Profile Page ("/perfil")
│             └─ page.tsx
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
│    └── (user_id, course_id, payment_id, amount, purchased_at)
│
├─ courses                  // Course details, promo video, price, etc.
│    ├─ course_sections     // Sections within each course
│    │     └── lessons      // Lessons in each section
│    │             └── exams
│    │                    └── exam_questions  // Optional: exam questions for each exam
│    └── (course details, promo_video_url, slug, title, description, price)
│
├─ user_exam_attempts       // Tracks exam attempts by users, linking users and exams
│
├─ coupons                  // Discount codes/coupons
│
└─ blog_posts               // Blog posts for SEO and content marketing
     └── (slug, title, content, published_at, author_id → profiles/users)
