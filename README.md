# 🚀 سامانه مدیریت و گزارش‌دهی پروژه‌های توسعه‌دهندگان (Developer Project Tracker)

یک سیستم مدرن، منعطف و امن برای مدیریت، رصد لحظه‌ای پیشرفت تسک‌های توسعه‌دهندگان، آرشیو پروژه‌های تکمیل‌شده و صدور گزارش‌های تحلیلی اکسل (ExcelJS) با قابلیت اتصال به **SSO سازمانی** و پایگاه داده **Microsoft SQL Server**.

---

## 🌟 ویژگی‌های کلیدی سیستم

### ۱. نقش توسعه‌دهندگان (Developer Panel)
- **ثبت پروژه جدید**: تعریف عنوان، شرح تسک، تاریخ شروع و پایان (با پشتیبانی کامل تاریخ شمسی).
- **اسلایدر تعاملی پیشرفت (Interactive Range Slider)**: تغییر آنی درصد پیشرفت (۰ تا ۱۰۰ درصد) با نوار گرافیکی طیف گرادینت سایان به مگنتا و به‌روزرسانی خودکار (Auto-Save Debounced) در پایگاه داده بدون نیاز به رفرش.
- **تغییر وضعیت هوشمند**: تغییر خودکار وضعیت به «تکمیل‌شده» به محض رسیدن اسلایدر به ۱۰۰٪ و بالعکس.
- **کارت‌های اختصاصی پروژه**: نمایش روزهای باقیمانده تا مهلت تحویل، هشدارهای تاخیر زمانی، ویرایش و حذف.

### ۲. نقش مدیران سیستم (Admin Panel)
- **میز کار نظارتی جامع**: رصد عملکرد تمامی توسعه‌دهندگان به تفکیک یا کلی.
- **جدول پیشرفته با فیلتر چندگانه**: جستجوی متنی زنده در عناوین و توضیحات، فیلتر بر اساس توسعه‌دهنده، فیلتر وضعیت و مرتب‌سازی ستونی بر اساس تاریخ تحویل، درصد پیشرفت یا عنوان.
- **خروجی اکسل پیشرفته (ExcelJS Engine)**:
  - **خروجی جامع سازمانی**: دانلود فایل اکسل شکیل با چیدمان راست‌به‌چپ (RTL)، هدرهای رنگی سازمانی، آمار تجمیعی و رنگ‌آمیزی وضعیت‌ها برای تمامی پروژه‌های شرکت.
  - **خروجی تفکیک‌شده بر اساس کاربر**: انتخاب توسعه‌دهنده و دانلود کارنامه کاری اختصاصی فرد.
- **کارت‌های شاخص عملکرد (KPI Cards)**: نمایش لحظه‌ای تعداد کل پروژه‌ها، تسک‌های در حال انجام، پروژه‌های تحویل‌شده، میانگین درصد پیشرفت تیم و توسعه‌دهندگان فعال.

### ۳. زیرساخت و احراز هویت سازمانی (SSO-Ready Architecture)
- فرم ورود اختصاصی ایمن با هشینگ پسورد (`bcryptjs`) و نشست‌های JWT در کوکی‌های امن (`HttpOnly`).
- پیش‌بینی فیلد `ssoId` در جدول پایگاه داده و لایه ماژولار در `/api/auth/sso-mock` جهت اتصال مستقیم به سرورهای احراز هویت متمرکز سازمان (مانند Azure AD, Keycloak, OAuth 2.0, SAML).
- نوار دسترسی سریع برای تغییر نقش (Admin / Developer) جهت سهولت در بررسی و تست زنده.

### ۴. طراحی بصری و تجربه کاربری (UI/UX)
- **دارک مود مدرن (Navy & Cyan-Magenta)**: پس‌زمینه سرمه‌ای تیره عمیق (`#070d1e`) با تلفیق هاله‌ها و گرادینت‌های سایان (`#06b6d4`) و مگنتا (`#d946ef`).
- **لایت مود استاندارد**: امکان تغییر فوری با دکمه اختصاصی روی نوار بالا با رعایت کنتراست و خوانایی بالا.
- **پشتیبانی کامل فارسی و راست‌به‌چپ (RTL)** با فرمت‌بندی تاریخ‌های شمسی.

---

## 🛠️ استک فنی

| بخش | تکنولوژی |
| :--- | :--- |
| **فریم‌ورک فول‌استک** | Next.js 15 (App Router, Server & Client Components) |
| **زبان برنامه‌نویسی** | TypeScript |
| **استایل‌دهی و تم** | Tailwind CSS v4 + کلاس‌های سفارشی گرادینت و متغیرهای دارک/لایت مود |
| **پایگاه داده** | Microsoft SQL Server (اسکریپت کامل در `sql/schema.sql` روی پایگاه داده `ProjectTrackerDb`) به همراه لایه ذخیره‌سازی همگام‌شده محلی |
| **موتور تولید اکسل** | ExcelJS با استایل‌دهی حرفه‌ای، فونت تاهوما، رنگ‌آمیزی شرطی و راست‌به‌چپ |
| **آیکون‌ها** | Lucide React |

---

## 🗄️ ساختار پایگاه داده (SQL Server Schema)

اسکریپت دیتابیس در مسیر [sql/schema.sql](file:///c:/Users/user/Desktop/Report/sql/schema.sql) قرار دارد و روی دیتابیس `ProjectTrackerDb` در SQL Server اعمال شده است:

```sql
-- جدول کاربران (Users)
CREATE TABLE dbo.Users (
    Id NVARCHAR(50) NOT NULL PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Email NVARCHAR(150) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(255) NOT NULL,
    Role NVARCHAR(20) NOT NULL DEFAULT 'DEVELOPER', -- 'ADMIN' یا 'DEVELOPER'
    SsoId NVARCHAR(100) NULL, -- اتصال به سامانه یکپارچه SSO
    Department NVARCHAR(100) NULL,
    Avatar NVARCHAR(255) NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

-- جدول پروژه‌ها (Projects)
CREATE TABLE dbo.Projects (
    Id NVARCHAR(50) NOT NULL PRIMARY KEY,
    UserId NVARCHAR(50) NOT NULL,
    Title NVARCHAR(200) NOT NULL,
    Description NVARCHAR(MAX) NULL,
    Status NVARCHAR(20) NOT NULL DEFAULT 'IN_PROGRESS', -- 'IN_PROGRESS' یا 'COMPLETED'
    Progress INT NOT NULL DEFAULT 0, -- ۰ تا ۱۰۰
    StartDate DATE NOT NULL,
    EndDate DATE NOT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_Projects_Users FOREIGN KEY (UserId) REFERENCES dbo.Users(Id) ON DELETE CASCADE,
    CONSTRAINT CK_Projects_Progress CHECK (Progress >= 0 AND Progress <= 100),
    CONSTRAINT CK_Projects_Status CHECK (Status IN ('IN_PROGRESS', 'COMPLETED'))
);
```

---

## 🔑 حساب‌های کاربری پیش‌فرض جهت تست

| نقش | نام کاربر | ایمیل | رمز عبور پیش‌فرض | شناسه SSO |
| :--- | :--- | :--- | :--- | :--- |
| **مدیر کل سیستم** | مهندس محمدی | `admin@company.com` | `Admin123!` | `SSO-ADM-001` |
| **توسعه‌دهنده فرانت‌اند** | سارا رضایی | `sara@company.com` | `Dev123!` | `SSO-DEV-101` |
| **توسعه‌دهنده بک‌اند** | علی اکبری | `ali@company.com` | `Dev123!` | `SSO-DEV-102` |
| **مهندس DevOps** | نیما شمس | `nima@company.com` | `Dev123!` | `SSO-DEV-103` |

> 💡 در صفحه لاگین دکمه‌های «ورود سریع با یک کلیک» برای هر نقش تعبیه شده است تا بدون نیاز به تایپ دستی بتوانید عملکرد هر دو نقش را بیازمایید.

---

## 🚀 نحوه اجرا و راه‌اندازی

```bash
# نصب پکیج‌ها (در صورت نیاز مجدد)
npm install

# اجرای سرور توسعه (Development)
npm run dev
```

سامانه روی پورت پیش‌فرض در آدرس زیر در دسترس است:
👉 **[http://localhost:3000](http://localhost:3000)**
