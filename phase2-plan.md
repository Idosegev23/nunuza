# 🚀 Nunuza Marketplace - Phase 2 Development Plan

## 🎯 **מטרה כללית:**
הפיכת Nunuza לפלטפורמה המובילה במזרח אפריקה עם תכונות מתקדמות שישפרו את חווית המשתמש ויגדילו את המעורבות.

---

## **📈 סדר עדיפויות לפיתוח:**

### **🔥 שלב 1: מערכת הודעות ותקשורת (2-3 ימים)**

#### **1.1 צ'אט בזמן אמת**
- **מסד נתונים**: טבלאות `conversations`, `messages`
- **UI Components**: ChatWindow, MessageBubble, ConversationList  
- **Realtime**: Supabase Realtime subscriptions
- **תכונות**: שליחת הודעות, היסטוריה, סטטוס קריאה

**Technical Implementation:**
```
Tables:
- conversations (id, participant_1, participant_2, post_id, created_at, updated_at)
- messages (id, conversation_id, sender_id, content, read_at, created_at)

Components:
- src/components/messaging/ChatWindow.tsx
- src/components/messaging/MessageBubble.tsx  
- src/components/messaging/ConversationList.tsx
- src/hooks/useConversations.ts
- src/hooks/useMessages.ts
```

#### **1.2 ממשק הודעות בדשבורד**
- **טאב חדש**: "Messages" בדשבורד המשתמש
- **רשימת שיחות**: עם תמונות משתמשים וההודעה האחרונה
- **התראות**: מונה הודעות לא נקראות
- **חיפוש**: חיפוש בשיחות ובהודעות

---

### **🔥 שלב 2: מערכת התראות מתקדמת (1-2 ימים)**

#### **2.1 התראות במערכת**
- **טבלת notifications**: התראות לכל משתמש
- **סוגי התראות**: הודעה חדשה, מישהו הוסיף למועדפים, פוסט נמכר
- **UI**: פעמון התראות בheader עם dropdown
- **מארק כנקרא**: ניהול סטטוס התראות

**Technical Implementation:**
```
Table:
- notifications (id, user_id, type, title, message, related_id, read_at, created_at)

Components:
- src/components/notifications/NotificationBell.tsx
- src/components/notifications/NotificationDropdown.tsx
- src/hooks/useNotifications.ts
```

#### **2.2 התראות אימייל**
- **Supabase Edge Functions**: שליחת אימיילים
- **Templates**: תבניות אימייל מקצועיות
- **הגדרות**: משתמש יכול לבחור איזה התראות לקבל

---

### **🔥 שלב 3: חיפוש ופילטרים מתקדמים (2-3 ימים)**

#### **3.1 חיפוש מבוסס מיקום**
- **Geolocation API**: זיהוי מיקום משתמש
- **מפות**: אינטגרציה עם מפות (Leaflet/OpenStreetMap)
- **חיפוש ברדיוס**: "הצג מודעות במרחק של X ק"מ"
- **מיון לפי מרחק**: הקרוב ביותר קודם

**Technical Implementation:**
```
Dependencies:
- leaflet, react-leaflet
- geolib for distance calculations

Components:
- src/components/search/LocationSearch.tsx
- src/components/search/MapView.tsx
- src/hooks/useGeolocation.ts
```

#### **3.2 פילטרים מתקדמים**
- **שמירת חיפושים**: שמירת חיפושים מועדפים
- **התראות על חיפושים**: התראה כשיש מודעה חדשה שמתאימה
- **פילטרים נוספים**: תאריך פרסום, מצב הפריט, טווח מחירים משופר
- **מיון מתקדם**: לפי פופולריות, מחיר, תאריך

---

### **🔥 שלב 4: תכונות עסקיות ומונטיזציה (2-3 ימים)**

#### **4.1 מודעות מקודמות**
- **Featured Posts**: מודעות מקודמות בראש העמוד
- **Boost**: העלאת מודעות בתוצאות החיפוש
- **תמחור**: מערכת תשלומים פשוטה
- **ניהול**: דשבורד לניהול מודעות מקודמות

**Technical Implementation:**
```
Database Updates:
- posts: add featured_until, boost_level columns
- Add pricing table for promotion costs

Components:
- src/components/promotion/PromoteModal.tsx
- src/components/admin/PromotionManager.tsx
```

#### **4.2 חשבונות עסקיים**
- **סוג חשבון עסקי**: תווית מיוחדת למוכרים עסקיים
- **סטטיסטיקות עסקיות**: ניתוח ביצועים, צפיות, פניות
- **פרסום בכמויות**: יכולת להעלות מספר מודעות בבת אחת
- **ניהול מלאי**: מעקב אחר מלאי ומוצרים

---

### **🔥 שלב 5: PWA ותכונות מובייל (1-2 ימים)**

#### **5.1 Progressive Web App**
- **Service Worker**: עבודה במצב לא מקוון
- **App Manifest**: התקנה כאפליקציה
- **Push Notifications**: התראות דחיפה
- **Offline Support**: צפייה במודעות שנשמרו

**Technical Implementation:**
```
Files to add:
- public/sw.js (Service Worker)
- public/manifest.json (App Manifest)
- src/lib/notifications.ts (Push notifications)
```

#### **5.2 אופטימיזציה למובייל**
- **מהירות טעינה**: אופטימיזציה לחיבורים איטיים
- **גלישה בג'סטים**: swipe, pull-to-refresh
- **תמונות מותאמות**: WebP, lazy loading משופר
- **אנימציות**: מעברים חלקים למובייל

---

### **🔥 שלב 6: אנליטיקס ובטחון (1-2 ימים)**

#### **6.1 אנליטיקס למשתמשים**
- **דשבורד אנליטיקס**: צפיות, פניות, מגמות
- **דוחות שבועיים**: סיכום פעילות אוטומטי
- **המלצות**: הצעות לשיפור מודעות
- **השוואות**: ביצועים מול המתחרים

#### **6.2 בטחון ואימות**
- **אימות משתמשים**: אימות טלפון/אימייל
- **דירוג משתמשים**: מערכת ביקורות ודירוגים
- **דיווח על תוכן**: דיווח על מודעות חשודות
- **מודרציה**: כלים לניהול תוכן

---

## **📅 לוח זמנים מפורט:**

### **שבוע 1: תקשורת ואינטראקציה**
- **יום 1**: יצירת טבלאות conversations & messages
- **יום 2**: בניית UI components לצ'אט
- **יום 3**: אינטגרציה עם Supabase Realtime
- **יום 4**: טבלת notifications ו-UI פעמון התראות
- **יום 5**: Edge Functions לאימיילים

### **שבוע 2: חיפוש וגילוי**
- **יום 1**: אינטגרציה עם Geolocation API
- **יום 2**: הוספת מפות עם Leaflet
- **יום 3**: חיפוש ברדיוס ומיון לפי מרחק
- **יום 4**: שמירת חיפושים
- **יום 5**: התראות על חיפושים

### **שבוע 3: עסקי ומובייל**
- **יום 1**: מודעות מקודמות - Featured Posts
- **יום 2**: מערכת Boost ותמחור
- **יום 3**: חשבונות עסקיים וסטטיסטיקות
- **יום 4**: Service Worker ו-App Manifest
- **יום 5**: Push Notifications ו-Offline Support

### **שבוע 4: גימור וביטחון**
- **יום 1**: דשבורד אנליטיקס למשתמשים
- **יום 2**: דוחות ו-insights אוטומטיים
- **יום 3**: מערכת אימות משתמשים משופרת
- **יום 4**: מערכת דירוגים ודיווחים
- **יום 5**: בדיקות סופיות ודוקומנטציה

---

## **🎯 KPIs ומדדי הצלחה:**

### **שבוע 1 - תקשורת:**
- [ ] 100% משתמשים יכולים לשלוח הודעות
- [ ] ממוצע זמן תגובה < 2 שניות להודעות
- [ ] 90% מההתראות מתקבלות תוך 10 שניות

### **שבוע 2 - חיפוש:**
- [ ] 95% דיוק בחיפוש מבוסס מיקום
- [ ] זמן טעינה של מפות < 3 שניות
- [ ] 80% מהמשתמשים משתמשים בפילטרים מתקדמים

### **שבוע 3 - עסקי:**
- [ ] 100% זמינות מערכת התשלומים
- [ ] זמן טעינה כ-PWA < 2 שניות
- [ ] 90% מההתראות הדחיפה מתקבלות

### **שבוע 4 - אנליטיקס:**
- [ ] 100% מהנתונים מדויקים בדוחות
- [ ] זמן טעינה דשבורד אנליטיקס < 3 שניות
- [ ] 95% מהמשתמשים מאומתים

---

## **🛠️ טכנולוגיות וכלים נוספים:**

### **Dependencies חדשות:**
```json
{
  "leaflet": "^1.9.4",
  "react-leaflet": "^4.2.1", 
  "geolib": "^3.3.4",
  "workbox-webpack-plugin": "^7.0.0",
  "react-intersection-observer": "^9.5.3"
}
```

### **Supabase Features:**
- **Realtime Subscriptions**: להודעות בזמן אמת
- **Edge Functions**: לשליחת אימיילים והתראות
- **Storage**: לשמירת קבצי מדיה נוספים
- **Row Level Security**: לבטחון מתקדם

### **External APIs:**
- **Geolocation API**: למיקום משתמשים
- **OpenStreetMap**: למפות בחינם
- **Web Push API**: להתראות דחיפה

---

## **📋 Checklist ליישום:**

### **הכנות:**
- [ ] עדכון memory bank עם התכנית
- [ ] יצירת branches חדשים ב-Git
- [ ] הכנת environment variables חדשים

### **שלב 1 - הודעות:**
- [ ] יצירת טבלאות conversations & messages
- [ ] בניית useConversations hook
- [ ] קומפוננט ChatWindow
- [ ] אינטגרציה עם Realtime
- [ ] טאב Messages בדשבורד

### **המשך לפי התכנית...**

---

**🎯 התכנית הזאת תישמר ותעודכן בכל שלב. נעבוד לפיה צעד אחר צעד לבניית הפלטפורמה המתקדמת ביותר במזרח אפריקה!** 🚀 