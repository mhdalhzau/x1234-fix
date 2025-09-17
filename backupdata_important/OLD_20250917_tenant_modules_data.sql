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
-- Data for Name: tenant_modules; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.tenant_modules (tenant_id, module_id, is_enabled, enabled_at, enabled_by) FROM stdin;
\.


--
-- PostgreSQL database dump complete
--

