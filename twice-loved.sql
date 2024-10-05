\echo 'Delete and recreate twiceloved db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE twiceloved;
CREATE DATABASE twiceloved;
\connect twiceloved

\i twice-loved-schema.sql

\echo 'Delete and recreate twice-loved db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE IF EXISTS twiceloved_test;
CREATE DATABASE twiceloved_test;
\connect twiceloved_test

\i twice-loved-schema.sql