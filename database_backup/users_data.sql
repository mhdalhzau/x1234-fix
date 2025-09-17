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
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.users (id, tenant_id, username, email, password_hash, role, is_active, last_login_at, created_at, updated_at) FROM stdin;
9519bbe5-f835-4e5e-9848-fde5dbbdae71	\N	superadmin	admin@system.com	$2a$10$BjGQFR/1b5xPSFaltA2sLeOmnoqh6DCMQczxb.4LMAYNd/b/Hmt0K	admin	t	\N	2025-09-17 05:02:43.76983	2025-09-17 05:02:43.76983
\.


--
-- PostgreSQL database dump complete
--

