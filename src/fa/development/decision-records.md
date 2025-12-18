# سوابق تصمیم‌گیری معماری (ADRs)

سوابق تصمیم‌گیری معماری (ADRs) اسناد متنی کوتاهی هستند که یک تصمیم معماری مهم گرفته شده را به همراه زمینه و پیامدهای آن ثبت می‌کنند. ما از ADRها برای پیگیری تاریخچه تصمیماتمان و استدلال‌های پشت آن‌ها استفاده می‌کنیم.

## مکان فایل

تمام ADRها باید در پروژه [doc](https://github.com/distributed-timetable-assistant/doc/tree/master/src/fa/architecture/adr/) قرار گیرند.

## قرارداد نام‌گذاری

فایل‌های ADR باید با استفاده از یک شماره ترتیبی و یک عنوان کوتاه توصیفی، که با خط تیره جدا شده‌اند، نام‌گذاری شوند. فرمت به این صورت است: `NNNNNN-title-of-the-decision.md`.

مثال: `000001-record-architecture-decisions.md`

## وضعیت‌ها

یک ADR می‌تواند یکی از وضعیت‌های زیر را داشته باشد:

- **پیشنهاد شده (Proposed)**: تصمیم در حال بحث است و هنوز توافق نشده است.
- **پذیرفته شده (Accepted)**: تصمیم توافق شده و باید پیاده‌سازی شود.
- **رد شده (Rejected)**: تصمیم پیشنهاد و بحث شده اما پذیرفته نشده است. سابقه برای زمینه تاریخی نگهداری می‌شود.
- **منسوخ شده (Deprecated)**: تصمیم در گذشته پذیرفته شده اما دیگر قابل اجرا یا توصیه شده نیس.
- **جایگزین شده (Superseded)**: تصمیم با یک تصمیم جدیدتر جایگزین شده است. ADR جدید باید به ADR جایگزین شده ارجاع دهد.

## قالب (Template)

از قالب زیر برای ADRهای جدید استفاده کنید:

```markdown
# NNNN. Title of the Decision

Date: YYYY-MM-DD

## Status

[Proposed | Accepted | Rejected | Deprecated | Superseded]

## Context

What is the issue that we're seeing that is motivating this decision or change?

## Decision

What is the change that we're proposing and/or doing?

## Consequences

What becomes easier or more difficult to do and any risks introduced by the change that will need to be mitigated.
```

## نحوه ارسال

1.  یک شاخه جدید برای ADR خود بسازید.
2.  فایل ADR جدید را در پروژه [doc](https://github.com/distributed-timetable-assistant/doc/tree/master/src/en/adr/) اضافه کنید.
3.  اطمینان حاصل کنید که نام فایل از شماره در دسترس بعدی استفاده می‌کند.
4.  یک Pull Request برای بازبینی ارسال کنید.
