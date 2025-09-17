--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9 (02a153c)
-- Dumped by pg_dump version 16.9

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.refresh_tokens (id, user_id, token, expires_at, created_at) FROM stdin;
25e0983e-0d46-42a8-9cde-06e326765fe3	9519bbe5-f835-4e5e-9848-fde5dbbdae71	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI5NTE5YmJlNS1mODM1LTRlNWUtOTg0OC1mZGU1ZGJiZGFlNzEiLCJ0ZW5hbnRJZCI6bnVsbCwicm9sZSI6ImFkbWluIiwiZW1haWwiOiJhZG1pbkBzeXN0ZW0uY29tIiwiaWF0IjoxNzU4MDg1MzcyLCJleHAiOjE3NTg2OTAxNzJ9.S0qby_kN71skXZ5b8HEBJ5I4B24Bjbdj3c-WGdNfmSE	2025-09-24 05:02:52.356	2025-09-17 05:02:52.388473
188b0722-c498-459e-a3b2-ba9f567ee1f6	9519bbe5-f835-4e5e-9848-fde5dbbdae71	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI5NTE5YmJlNS1mODM1LTRlNWUtOTg0OC1mZGU1ZGJiZGFlNzEiLCJ0ZW5hbnRJZCI6bnVsbCwicm9sZSI6ImFkbWluIiwiZW1haWwiOiJhZG1pbkBzeXN0ZW0uY29tIiwiaWF0IjoxNzU4MDg1Mzk1LCJleHAiOjE3NTg2OTAxOTV9.yZdupDAUJ4QCcKwGfs4_uqpbbLHdf6RKpxIgev4fK_A	2025-09-24 05:03:15.903	2025-09-17 05:03:15.934456
d8ad1b1e-481c-405e-b4c3-fdc168e26eff	9519bbe5-f835-4e5e-9848-fde5dbbdae71	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI5NTE5YmJlNS1mODM1LTRlNWUtOTg0OC1mZGU1ZGJiZGFlNzEiLCJ0ZW5hbnRJZCI6bnVsbCwicm9sZSI6ImFkbWluIiwiZW1haWwiOiJhZG1pbkBzeXN0ZW0uY29tIiwiaWF0IjoxNzU4MDg1NDUzLCJleHAiOjE3NTg2OTAyNTN9.OOux7he8U-QK8ni3b060NhVX_w8YGX1FQI4n_vdjT5E	2025-09-24 05:04:13.185	2025-09-17 05:04:13.216715
\.


--
-- PostgreSQL database dump complete
--

