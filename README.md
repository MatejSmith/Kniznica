# Knižnica - Návod na inštaláciu

Webová aplikácia pre správu knižnice.

---

## Požiadavky

Pred inštaláciou je potrebné mať nainštalované:

- **Node.js** (verzia 18.x alebo novšia) - [nodejs.org](https://nodejs.org/)
- **PostgreSQL** (verzia 13.x alebo novšia) - [postgresql.org](https://www.postgresql.org/download/)

---

## Inštalácia

### 1. Stiahnutie projektu

Naklonujte repozitár pomocou Git:
```bash
git clone https://github.com/MatejSmith/Kniznica.git
cd Kniznica
```

Alebo stiahnite ZIP súbor priamo z GitHub stránky a rozbaľte ho.

### 2. Nastavenie databázy

1. Spustite PostgreSQL a prihláste sa:
   ```bash
   psql -U postgres
   ```

2. Vytvorte databázu:
   ```sql
   CREATE DATABASE kniznica_db;
   ```

3. Prepnite sa do novej databázy:
   ```sql
   \c kniznica_db
   ```

4. Vytvorte potrebné tabuľky:
   ```sql
   CREATE TABLE users (
       id SERIAL PRIMARY KEY,
       username VARCHAR(255) NOT NULL,
       email VARCHAR(255) UNIQUE NOT NULL,
       password VARCHAR(255) NOT NULL,
       role VARCHAR(50) DEFAULT 'user',
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

   CREATE TABLE books (
       id SERIAL PRIMARY KEY,
       title VARCHAR(255) NOT NULL,
       author VARCHAR(255) NOT NULL,
       description TEXT,
       isbn VARCHAR(20),
       available_copies INTEGER DEFAULT 1,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

   CREATE TABLE reservations (
       id SERIAL PRIMARY KEY,
       user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
       book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
       reserved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       status VARCHAR(50) DEFAULT 'active'
   );

   CREATE TABLE reviews (
       id SERIAL PRIMARY KEY,
       user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
       book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
       rating INTEGER CHECK (rating >= 1 AND rating <= 5),
       comment TEXT,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

### 3. Inštalácia BackEndu

1. Prejdite do priečinka BackEnd:
   ```bash
   cd BackEnd
   ```

2. Nainštalujte závislosti:
   ```bash
   npm install
   ```

3. Vytvorte súbor `.env` s nasledujúcim obsahom:
   ```env
   PORT=3000
   DB_USER=postgres
   DB_PASSWORD=vaše_heslo
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=kniznica_db
   JWT_SECRET=tajny_kluc
   ```
   
   > ⚠️ Nahraďte `vaše_heslo` vaším heslom do PostgreSQL.
   
   > ⚠️ Nahraďte `tajny_kluc` tak, aby to bol náhodný reťazec. Služba JWT potrebuje tieto kľúče na autentifikáciu.

### 4. Inštalácia FrontEndu

1. Prejdite do priečinka FrontEnd:
   ```bash
   cd FrontEnd
   ```

2. Nainštalujte závislosti:
   ```bash
   npm install
   ```

---

## Spustenie aplikácie

### Spustenie servera (BackEnd)

```bash
cd BackEnd/src
node server.js
```

Server beží na: `http://localhost:3000`

### Spustenie klienta (FrontEnd)

V novom termináli:

```bash
cd FrontEnd
npm run dev
```

Aplikácia je dostupná na: `http://localhost:5173`
