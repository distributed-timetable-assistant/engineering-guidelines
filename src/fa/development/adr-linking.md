# لینک‌دهی ADR

سوابق تصمیم‌گیری معماری (ADR) "چرایی" تغییرات مهم را توضیح می‌دهند. بسیار مهم است که تغییرات کد را به تصمیماتی که آن‌ها را مجاز کرده‌اند، لینک کنید.

## لینک کردن ADRها در کامیت‌ها

اگر یک کامیت یک ADR خاص را پیاده‌سازی می‌کند، مشابه ایشوها، در پاورقی پیام کامیت به آن ارجاع دهید.

فرمت:
```text
ADR: <ADR-Number>
```

مثال:
```text
feat(database): migrate to postgres

We are migrating to Postgres to support better transaction handling as decided.

Closes #45
ADR: 0012
```

## لینک کردن ADRها در ایشوها/PRها

هنگام باز کردن یک ایشو یا PR که مربوط به یک تصمیم معماری است، لینکی به فایل ADR در توضیحات اضافه کنید.

مثال:
> Implements [ADR-0012: Use Postgres](../architecture/decisions/0012-use-postgres.md)
