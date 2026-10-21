## Postgres в Омеге

### Data Types - Типы данных

| | Типы в коде | Типы в БД |
| --- | --- | --- |
| Общий целочисленных типов для pg и ora | `OMPCODE`, `CODE64`, `bool` | `NUMERIC` |
| Общий double для pg и ora | `double` | `NUMERIC(38, 12)` |

### Создание таблиц

Для pg нужно указывать `tablespace`, но не нужно указывать `storage`, соответственно из скрипта для pg удаляем `storage`.
<img src="images/create_table_pg_ora_diff.png" alt="Схема архитектуры" width="900">