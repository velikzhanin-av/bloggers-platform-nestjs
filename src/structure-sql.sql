--
-- PostgreSQL database dump
--

-- Dumped from database version 17.2 (Debian 17.2-1.pgdg120+1)
-- Dumped by pg_dump version 17.2 (Debian 17.2-1.pgdg120+1)

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: blogs; Type: TABLE; Schema: public; Owner: ubuntu
--

CREATE TABLE public.blogs (
    id character varying NOT NULL COLLATE pg_catalog."C",
    name character varying NOT NULL COLLATE pg_catalog."C",
    description character varying NOT NULL COLLATE pg_catalog."C",
    "websiteUrl" character varying NOT NULL COLLATE pg_catalog."C",
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "isMembership" boolean NOT NULL,
    "deletionStatus" character varying DEFAULT 'not-deleted'::character varying NOT NULL
);


ALTER TABLE public.blogs OWNER TO ubuntu;

--
-- Name: comment; Type: TABLE; Schema: public; Owner: ubuntu
--

CREATE TABLE public.comment (
    id character varying NOT NULL,
    content text NOT NULL,
    "postId" character varying,
    "userId" character varying,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "deletionStatus" character varying DEFAULT 'not-deleted'::character varying
);


ALTER TABLE public.comment OWNER TO ubuntu;

--
-- Name: posts; Type: TABLE; Schema: public; Owner: ubuntu
--

CREATE TABLE public.posts (
    id character varying NOT NULL,
    title character varying NOT NULL,
    "shortDescription" character varying NOT NULL,
    content text NOT NULL,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "blogId" character varying NOT NULL,
    "blogName" character varying NOT NULL,
    "deletionStatus" character varying DEFAULT 'not-deleted'::character varying NOT NULL
);


ALTER TABLE public.posts OWNER TO ubuntu;

--
-- Name: session; Type: TABLE; Schema: public; Owner: ubuntu
--

CREATE TABLE public.session (
    id character varying NOT NULL COLLATE pg_catalog."C",
    "deviceId" character varying NOT NULL COLLATE pg_catalog."C",
    "userId" character varying NOT NULL COLLATE pg_catalog."C",
    iat timestamp with time zone NOT NULL,
    exp timestamp with time zone NOT NULL,
    ip character varying NOT NULL COLLATE pg_catalog."C",
    "deviceName" character varying NOT NULL COLLATE pg_catalog."C",
    "deletionStatus" character varying DEFAULT 'not-deleted'::character varying
);


ALTER TABLE public.session OWNER TO ubuntu;

--
-- Name: users; Type: TABLE; Schema: public; Owner: ubuntu
--

CREATE TABLE public.users (
    "userId" character varying NOT NULL COLLATE pg_catalog."C",
    login character varying COLLATE pg_catalog."C",
    email character varying COLLATE pg_catalog."C",
    "deletionStatus" character varying DEFAULT 'not-deleted'::character varying COLLATE pg_catalog."C",
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "passwordHash" character varying COLLATE pg_catalog."C",
    "emailConfirmationCode" character varying,
    "emailExpirationDate" timestamp with time zone,
    "isConfirmed" boolean DEFAULT false
);


ALTER TABLE public.users OWNER TO ubuntu;

--
-- Name: blogs blogs_pkey; Type: CONSTRAINT; Schema: public; Owner: ubuntu
--

ALTER TABLE ONLY public.blogs
    ADD CONSTRAINT blogs_pkey PRIMARY KEY (id);


--
-- Name: comment comment_pkey; Type: CONSTRAINT; Schema: public; Owner: ubuntu
--

ALTER TABLE ONLY public.comment
    ADD CONSTRAINT comment_pkey PRIMARY KEY (id);


--
-- Name: posts posts_pkey; Type: CONSTRAINT; Schema: public; Owner: ubuntu
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_pkey PRIMARY KEY (id);


--
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: ubuntu
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: ubuntu
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY ("userId");


--
-- Name: comment comment_postId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ubuntu
--

ALTER TABLE ONLY public.comment
    ADD CONSTRAINT "comment_postId_fkey" FOREIGN KEY ("postId") REFERENCES public.posts(id) NOT VALID;


--
-- Name: comment comment_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ubuntu
--

ALTER TABLE ONLY public.comment
    ADD CONSTRAINT "comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users("userId") NOT VALID;


--
-- Name: session session_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ubuntu
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users("userId") NOT VALID;


--
-- PostgreSQL database dump complete
--
