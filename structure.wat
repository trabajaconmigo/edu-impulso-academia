edu-impulso-academia/
  ├─ src/
  │   └─ app/
  │       ├─ layout.tsx
  │       └─ page.tsx
  ├─ .eslintrc.json
  ├─ .gitignore
  ├─ package.json
  ├─ tsconfig.json
  └─ ... (other config files)


src/
  app/
    page.tsx          // Home Page ("/")
    cursos/
      page.tsx        // Courses list ("/cursos")
      [slug]/
        page.tsx      // Course detail ("/cursos/:slug")
        contenido/
          page.tsx    // Course content page ("/cursos/:slug/contenido")
          examen/
            [sectionId]/
              page.tsx
    concejos/
      page.tsx        // Blog listing
      [slug]/
        page.tsx      // Individual blog post
    login/
      page.tsx
    registro/
      page.tsx
    // etc...

//.... SUPABASE
users
  └──< purchases >── courses
                        ├──< course_sections >── lessons
                        │                          └── exams ──< exam_questions >
                        └── (course details, promo video, etc.)

users
  └──< user_exam_attempts >── exams

coupons

blog_posts
  └── author_id → users (opcional)
