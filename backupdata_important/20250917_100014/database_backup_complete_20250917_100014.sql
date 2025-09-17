--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9
-- Dumped by pg_dump version 17.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: billing_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.billing_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    subscription_id uuid,
    amount numeric(10,2) NOT NULL,
    currency text DEFAULT 'IDR'::text NOT NULL,
    payment_method text,
    status text DEFAULT 'pending'::text NOT NULL,
    paid_at timestamp without time zone,
    description text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    stripe_invoice_id text,
    CONSTRAINT billing_history_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'paid'::text, 'failed'::text, 'refunded'::text])))
);


ALTER TABLE public.billing_history OWNER TO postgres;

--
-- Name: modules; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.modules (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    display_name text NOT NULL,
    description text,
    is_default boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.modules OWNER TO postgres;

--
-- Name: outlets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.outlets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    name text NOT NULL,
    address text,
    phone character varying(20),
    is_active boolean DEFAULT true NOT NULL,
    created_by uuid NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.outlets OWNER TO postgres;

--
-- Name: refresh_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.refresh_tokens (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    token text NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.refresh_tokens OWNER TO postgres;

--
-- Name: subscription_plans; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subscription_plans (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    price numeric(10,2) NOT NULL,
    currency text DEFAULT 'IDR'::text NOT NULL,
    "interval" text DEFAULT 'monthly'::text NOT NULL,
    max_outlets integer DEFAULT 1 NOT NULL,
    max_users integer DEFAULT 5 NOT NULL,
    features text[] DEFAULT '{}'::text[] NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT subscription_plans_interval_check CHECK (("interval" = ANY (ARRAY['monthly'::text, 'yearly'::text])))
);


ALTER TABLE public.subscription_plans OWNER TO postgres;

--
-- Name: subscriptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subscriptions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    plan_id uuid NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    start_date timestamp without time zone DEFAULT now() NOT NULL,
    end_date timestamp without time zone NOT NULL,
    auto_renew boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT subscriptions_status_check CHECK ((status = ANY (ARRAY['active'::text, 'expired'::text, 'cancelled'::text, 'pending'::text])))
);


ALTER TABLE public.subscriptions OWNER TO postgres;

--
-- Name: tenant_modules; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tenant_modules (
    tenant_id uuid NOT NULL,
    module_id uuid NOT NULL,
    is_enabled boolean DEFAULT true NOT NULL,
    enabled_at timestamp without time zone DEFAULT now() NOT NULL,
    enabled_by uuid NOT NULL
);


ALTER TABLE public.tenant_modules OWNER TO postgres;

--
-- Name: tenants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tenants (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    business_name text NOT NULL,
    email character varying(255) NOT NULL,
    phone character varying(20),
    address text,
    status text DEFAULT 'trial'::text NOT NULL,
    trial_ends_at timestamp without time zone,
    subscription_id uuid,
    max_outlets integer DEFAULT 1 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    stripe_customer_id text,
    CONSTRAINT tenants_status_check CHECK ((status = ANY (ARRAY['trial'::text, 'active'::text, 'suspended'::text, 'expired'::text])))
);


ALTER TABLE public.tenants OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid,
    username character varying NOT NULL,
    email character varying NOT NULL,
    password_hash text NOT NULL,
    role text DEFAULT 'staff'::text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    last_login_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    stripe_customer_id text,
    stripe_subscription_id text,
    CONSTRAINT users_role_check CHECK ((role = ANY (ARRAY['superadmin'::text, 'tenant_owner'::text, 'staff'::text])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Data for Name: billing_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.billing_history (id, tenant_id, subscription_id, amount, currency, payment_method, status, paid_at, description, created_at, stripe_invoice_id) FROM stdin;
\.


--
-- Data for Name: modules; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.modules (id, name, display_name, description, is_default, created_at) FROM stdin;
23a65cee-aca4-4d93-beb2-79ca61821eb9	pos	Point of Sale	Core POS functionality for sales processing	t	2025-09-17 09:48:47.769706
1c8f777d-c25d-48fc-850b-38191660934d	inventory	Inventory Management	Track and manage product inventory	t	2025-09-17 09:48:47.769706
599c9cf4-0339-44ef-8db8-9b5a662d2aed	reports	Reports & Analytics	Sales reports and business analytics	f	2025-09-17 09:48:47.769706
05fef497-5073-4b9c-95b6-8030e35ce8e3	loyalty	Loyalty Program	Customer loyalty and rewards program	f	2025-09-17 09:48:47.769706
bb453315-8e8b-49e7-a3b3-ba8c92629d1f	pos	Point of Sale	Core POS functionality for sales processing	t	2025-09-17 09:50:19.465241
2c901236-3924-490c-a160-bf07402b0ad4	inventory	Inventory Management	Track and manage product inventory	t	2025-09-17 09:50:19.465241
14587b41-98c4-450a-9577-94b50bacaee6	reports	Reports & Analytics	Sales reports and business analytics	f	2025-09-17 09:50:19.465241
e5d6f1c1-0a01-4e75-bde6-bd7e6208e4f6	loyalty	Loyalty Program	Customer loyalty and rewards program	f	2025-09-17 09:50:19.465241
\.


--
-- Data for Name: outlets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.outlets (id, tenant_id, name, address, phone, is_active, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.refresh_tokens (id, user_id, token, expires_at, created_at) FROM stdin;
83fde65a-d98f-41f8-aaa8-f27fcbed131a	9519bbe5-f835-4e5e-9848-fde5dbbdae71	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI5NTE5YmJlNS1mODM1LTRlNWUtOTg0OC1mZGU1ZGJiZGFlNzEiLCJ0ZW5hbnRJZCI6bnVsbCwicm9sZSI6InN1cGVyYWRtaW4iLCJlbWFpbCI6ImFkbWluQHN5c3RlbS5jb20iLCJpYXQiOjE3NTgxMDMxODMsImV4cCI6MTc1ODcwNzk4M30.Lx5TBP5zJEonr2JnPqte_yfQRkjfz7wxH3_Q7RfBskU	2025-09-24 09:59:43.921	2025-09-17 09:59:43.923366
\.


--
-- Data for Name: subscription_plans; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subscription_plans (id, name, description, price, currency, "interval", max_outlets, max_users, features, is_active, created_at) FROM stdin;
d426cdf5-37c4-470c-93dd-311400c3172e	Basic	Perfect for small businesses	250000.00	IDR	monthly	1	3	{"Basic POS","Inventory Management","Sales Reports","Email Support"}	t	2025-09-17 09:48:47.763673
e4bdb7bc-61e7-47d6-823a-b71b9d1d593c	Pro	Great for growing businesses	500000.00	IDR	monthly	5	10	{"Advanced POS","Multi-outlet Management","Advanced Reports","Loyalty Program","Priority Support"}	t	2025-09-17 09:48:47.763673
d12816a3-ec4c-44c4-a908-b49c3caa20d9	Enterprise	For large businesses	1000000.00	IDR	monthly	999	999	{"Enterprise POS","Unlimited Outlets","Custom Reports","API Access","Dedicated Support"}	t	2025-09-17 09:48:47.763673
81a2c644-983d-463c-9b0f-0f3bd9d02a4b	Basic	Perfect for small businesses	250000.00	IDR	monthly	1	3	{"Basic POS","Inventory Management","Sales Reports","Email Support"}	t	2025-09-17 09:50:19.460439
38e74822-6b27-4b5d-b28a-4f6c26756b51	Pro	Great for growing businesses	500000.00	IDR	monthly	5	10	{"Advanced POS","Multi-outlet Management","Advanced Reports","Loyalty Program","Priority Support"}	t	2025-09-17 09:50:19.460439
a4ab536d-e310-41f2-9486-5543d9dba054	Enterprise	For large businesses	1000000.00	IDR	monthly	999	999	{"Enterprise POS","Unlimited Outlets","Custom Reports","API Access","Dedicated Support"}	t	2025-09-17 09:50:19.460439
\.


--
-- Data for Name: subscriptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subscriptions (id, tenant_id, plan_id, status, start_date, end_date, auto_renew, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: tenant_modules; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tenant_modules (tenant_id, module_id, is_enabled, enabled_at, enabled_by) FROM stdin;
\.


--
-- Data for Name: tenants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tenants (id, business_name, email, phone, address, status, trial_ends_at, subscription_id, max_outlets, created_at, updated_at, stripe_customer_id) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, tenant_id, username, email, password_hash, role, is_active, last_login_at, created_at, updated_at, stripe_customer_id, stripe_subscription_id) FROM stdin;
9519bbe5-f835-4e5e-9848-fde5dbbdae71	\N	superadmin	admin@system.com	$2a$10$BjGQFR/1b5xPSFaltA2sLeOmnoqh6DCMQczxb.4LMAYNd/b/Hmt0K	superadmin	t	\N	2025-09-17 05:02:43.76983	2025-09-17 05:02:43.76983	\N	\N
\.


--
-- Name: billing_history billing_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.billing_history
    ADD CONSTRAINT billing_history_pkey PRIMARY KEY (id);


--
-- Name: billing_history billing_history_stripe_invoice_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.billing_history
    ADD CONSTRAINT billing_history_stripe_invoice_id_key UNIQUE (stripe_invoice_id);


--
-- Name: modules modules_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.modules
    ADD CONSTRAINT modules_pkey PRIMARY KEY (id);


--
-- Name: outlets outlets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.outlets
    ADD CONSTRAINT outlets_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_token_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_key UNIQUE (token);


--
-- Name: subscription_plans subscription_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscription_plans
    ADD CONSTRAINT subscription_plans_pkey PRIMARY KEY (id);


--
-- Name: subscriptions subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_pkey PRIMARY KEY (id);


--
-- Name: tenant_modules tenant_modules_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenant_modules
    ADD CONSTRAINT tenant_modules_pkey PRIMARY KEY (tenant_id, module_id);


--
-- Name: tenants tenants_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_email_key UNIQUE (email);


--
-- Name: tenants tenants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_pkey PRIMARY KEY (id);


--
-- Name: tenants tenants_stripe_customer_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_stripe_customer_id_key UNIQUE (stripe_customer_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: billing_history billing_history_subscription_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.billing_history
    ADD CONSTRAINT billing_history_subscription_id_fkey FOREIGN KEY (subscription_id) REFERENCES public.subscriptions(id);


--
-- Name: billing_history billing_history_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.billing_history
    ADD CONSTRAINT billing_history_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: outlets outlets_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.outlets
    ADD CONSTRAINT outlets_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: outlets outlets_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.outlets
    ADD CONSTRAINT outlets_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: refresh_tokens refresh_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: subscriptions subscriptions_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.subscription_plans(id);


--
-- Name: subscriptions subscriptions_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: tenant_modules tenant_modules_enabled_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenant_modules
    ADD CONSTRAINT tenant_modules_enabled_by_fkey FOREIGN KEY (enabled_by) REFERENCES public.users(id);


--
-- Name: tenant_modules tenant_modules_module_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenant_modules
    ADD CONSTRAINT tenant_modules_module_id_fkey FOREIGN KEY (module_id) REFERENCES public.modules(id);


--
-- Name: tenant_modules tenant_modules_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenant_modules
    ADD CONSTRAINT tenant_modules_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: users users_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- PostgreSQL database dump complete
--

