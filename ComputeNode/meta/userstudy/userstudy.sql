--
-- PostgreSQL database dump
--

\restrict hpDKhkGiosJ7ZpdDfcJWfwibKZoeo2BuvQalhDLnc4pc3z8jLSr9rtC2P5fyvu6

-- Dumped from database version 16.14 (Ubuntu 16.14-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.14 (Ubuntu 16.14-0ubuntu0.24.04.1)

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: introduction; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.introduction (
    id integer NOT NULL,
    text text,
    name character varying(255)
);


ALTER TABLE public.introduction OWNER TO postgres;

--
-- Name: introduction_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.introduction ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.introduction_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: item; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.item (
    id integer NOT NULL,
    test_name character varying(255),
    dataset_name character varying(255),
    meta jsonb
);


ALTER TABLE public.item OWNER TO postgres;

--
-- Name: item_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.item ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.item_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: metric; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.metric (
    id integer NOT NULL,
    name character varying(255),
    min_label character varying(255),
    max_label character varying(255),
    tooltip character varying(255),
    scale integer
);


ALTER TABLE public.metric OWNER TO postgres;

--
-- Name: metric_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.metric ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.metric_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: participant; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.participant (
    id integer NOT NULL,
    worker_id character varying(255),
    age integer,
    gender character varying(255),
    nationality character varying(255),
    vision character varying(255),
    start_time timestamp with time zone,
    end_time timestamp with time zone,
    test_type character varying(255),
    test_link character varying(255),
    completion_code character varying(255),
    test_number character varying(255),
    valid boolean
);


ALTER TABLE public.participant OWNER TO postgres;

--
-- Name: participant_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.participant ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.participant_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: response; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.response (
    set_item_id integer NOT NULL,
    metric_id integer NOT NULL,
    participant_id integer NOT NULL,
    value integer NOT NULL
);


ALTER TABLE public.response OWNER TO postgres;

--
-- Name: set; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.set (
    id integer NOT NULL,
    name character varying(255)
);


ALTER TABLE public.set OWNER TO postgres;

--
-- Name: set_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.set ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.set_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: set_item; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.set_item (
    id integer NOT NULL,
    set_id integer,
    item_id integer
);


ALTER TABLE public.set_item OWNER TO postgres;

--
-- Name: set_item_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.set_item ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.set_item_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Data for Name: introduction; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.introduction (id, text, name) FROM stdin;
3	<h2>Welcome to the Color Transfer User Study</h2><h2><p style="font-size: 12px; font-weight: 400;">You will be presented with&nbsp;<b>51 tests</b>. Each test consists of a&nbsp;<b>source image</b>&nbsp;that has been color-adjusted using various color transfer methods to match the color statistics of a&nbsp;<b>reference image&nbsp;</b>resulting in two&nbsp;<b>output images</b>&nbsp;(See images below).<br><br><b>Note:</b>&nbsp;All images in this study are&nbsp;<b>virtual indoor scenes</b>&nbsp;generated using computer graphics. Please keep this in mind when evaluating the images.<br><br>For each test, you are asked to rate which&nbsp;<b>output image</b>&nbsp;has an overall better quality.</p><div classname="introduction-examples" style="font-size: 12px; font-weight: 400; display: flex; justify-content: space-between; gap: 2rem; margin: 2rem 0px;"><div style="flex: 1 1 0px; text-align: center; display: flex; flex-direction: column; align-items: center;"><img src="http://localhost:5173/ColorTransferLab/src.png" alt="Source Example" style="width: 150px; max-width: 150px; height: auto; border-radius: 8px; box-shadow: rgba(0, 0, 0, 0.1) 0px 1px 6px;"><div classname="label" style="margin-top: 0.5rem; font-weight: bold;">Source</div></div><div style="flex: 1 1 0px; text-align: center; display: flex; flex-direction: column; align-items: center;"><img src="http://localhost:5173/ColorTransferLab/out.png" alt="Output Example" style="width: 150px; max-width: 150px; height: auto; border-radius: 8px; box-shadow: rgba(0, 0, 0, 0.1) 0px 1px 6px;"><div classname="label" style="margin-top: 0.5rem; font-weight: bold;">Output 1</div></div><div style="flex: 1 1 0px; text-align: center; display: flex; flex-direction: column; align-items: center;"><img src="http://localhost:5173/ColorTransferLab/out_2.png" alt="Output Example" style="width: 150px; max-width: 150px; height: auto; border-radius: 8px; box-shadow: rgba(0, 0, 0, 0.1) 0px 1px 6px;"><div classname="label" style="margin-top: 0.5rem; font-weight: bold;">Output 2</div></div><div style="flex: 1 1 0px; text-align: center; display: flex; flex-direction: column; align-items: center;"><img src="http://localhost:5173/ColorTransferLab/ref.png" alt="Reference Example" style="width: 150px; max-width: 150px; height: auto; border-radius: 8px; box-shadow: rgba(0, 0, 0, 0.1) 0px 1px 6px;"><div classname="label" style="margin-top: 0.5rem; font-weight: bold;">Reference</div></div></div><p style="font-size: 12px; font-weight: 400;"><b>Important:</b>&nbsp;You have&nbsp;<b>30 minutes</b>&nbsp;to complete the study. The test is only considered complete if you click the&nbsp;<b>Submit</b>&nbsp;button at the end. Please make sure to answer all tests.<br><br>By clicking&nbsp;<b>Continue</b>, you confirm that you have read and understood the instructions.</p></h2>	comparison
4	<h2>Welcome to the Color Transfer User Study</h2><p>You will be presented with&nbsp;<b>51 tests</b>. Each test consists of a&nbsp;<b>source image</b>&nbsp;that has been color-adjusted using various color transfer methods to match the color statistics of a&nbsp;<b>reference image&nbsp;</b>resulting multiple&nbsp;<b>output images</b>&nbsp;(See images below).<br><br><b>Note:</b>&nbsp;All images in this study are&nbsp;<b>virtual indoor scenes</b>&nbsp;generated using computer graphics. Please keep this in mind when evaluating the images.<br><br>For each test, you are asked to sort the&nbsp;<b>output images</b>&nbsp;by their overall better quality.</p><div classname="introduction-examples" style="display: flex; justify-content: space-between; gap: 2rem; margin: 2rem 0px;"><div style="flex: 1 1 0px; text-align: center; display: flex; flex-direction: column; align-items: center;"><img src="http://localhost:5173/ColorTransferLab/src.png" alt="Source Example" style="width: 220px; max-width: 220px; height: auto; border-radius: 8px; box-shadow: rgba(0, 0, 0, 0.1) 0px 1px 6px;"><div classname="label" style="margin-top: 0.5rem; font-weight: bold;">Source</div></div><div style="flex: 1 1 0px; text-align: center; display: flex; flex-direction: column; align-items: center;"><img src="http://localhost:5173/ColorTransferLab/ref.png" alt="Reference Example" style="width: 220px; max-width: 220px; height: auto; border-radius: 8px; box-shadow: rgba(0, 0, 0, 0.1) 0px 1px 6px;"><div classname="label" style="margin-top: 0.5rem; font-weight: bold;">Reference</div></div></div><div classname="introduction-examples" style="display: flex; justify-content: space-between; gap: 2rem; margin: 2rem 0px;"><div style="flex: 1 1 0px; text-align: center; display: flex; flex-direction: column; align-items: center;"><img src="http://localhost:5173/ColorTransferLab/out.png" alt="Source Example" style="width: 150px; max-width: 150px; height: auto; border-radius: 8px; box-shadow: rgba(0, 0, 0, 0.1) 0px 1px 6px;"><div classname="label" style="margin-top: 0.5rem; font-weight: bold;">Output 1</div></div><div style="flex: 1 1 0px; text-align: center; display: flex; flex-direction: column; align-items: center;"><img src="http://localhost:5173/ColorTransferLab/out_2.png" alt="Output Example" style="width: 150px; max-width: 150px; height: auto; border-radius: 8px; box-shadow: rgba(0, 0, 0, 0.1) 0px 1px 6px;"><div classname="label" style="margin-top: 0.5rem; font-weight: bold;">Output 2</div></div><div style="flex: 1 1 0px; text-align: center; display: flex; flex-direction: column; align-items: center;"><img src="http://localhost:5173/ColorTransferLab/out_3.png" alt="Reference Example" style="width: 150px; max-width: 150px; height: auto; border-radius: 8px; box-shadow: rgba(0, 0, 0, 0.1) 0px 1px 6px;"><div classname="label" style="margin-top: 0.5rem; font-weight: bold;">Output 3</div></div><div style="flex: 1 1 0px; text-align: center; display: flex; flex-direction: column; align-items: center;"><img src="http://localhost:5173/ColorTransferLab/out_4.png" alt="Reference Example" style="width: 150px; max-width: 150px; height: auto; border-radius: 8px; box-shadow: rgba(0, 0, 0, 0.1) 0px 1px 6px;"><div classname="label" style="margin-top: 0.5rem; font-weight: bold;">Output 4</div></div><div style="flex: 1 1 0px; text-align: center; display: flex; flex-direction: column; align-items: center;"><img src="http://localhost:5173/ColorTransferLab/out_5.png" alt="Reference Example" style="width: 150px; max-width: 150px; height: auto; border-radius: 8px; box-shadow: rgba(0, 0, 0, 0.1) 0px 1px 6px;"><div classname="label" style="margin-top: 0.5rem; font-weight: bold;">Output 5</div></div></div><p><b>Important:</b>&nbsp;You have&nbsp;<b>30 minutes</b>&nbsp;to complete the study. The test is only considered complete if you click the&nbsp;<b>Submit</b>&nbsp;button at the end. Please make sure to answer all tests.<br><br>By clicking&nbsp;<b>Continue</b>, you confirm that you have read and understood the instructions.</p>	ranking
2	<h2>Welcome to the Color Transfer User Study</h2><p>You will be presented with&nbsp;<b>51 tests</b>. Each test consists of a&nbsp;<b>source image</b>&nbsp;that has been color-adjusted using various color transfer methods to match the color statistics of a&nbsp;<b>reference image</b>&nbsp;(See images below).<br><br><b>Note:</b>&nbsp;All images in this study are&nbsp;<b>virtual indoor scenes</b>&nbsp;generated using computer graphics. Please keep this in mind when evaluating the images.<br><br>For each test, you are asked to rate the&nbsp;<b>output image</b>&nbsp;on the following four criteria using a 5-point Likert scale:</p><ol><li><b>Naturalness:</b>&nbsp;Does the image look realistic and plausible, or does it appear artificial or unnatural?</li><li><b>Similarity to the reference:</b>&nbsp;How closely does the output images scene match the color appearance of the reference images scene?</li><li><b>Artifacts:</b>&nbsp;Are there any visible errors, distortions, or unwanted effects introduced by the color transfer?</li><li><b>Overall quality:</b>&nbsp;What is your overall impression of the output image, considering all aspects?</li></ol><div classname="introduction-examples" style="display: flex; justify-content: space-between; gap: 2rem; margin: 2rem 0px;"><div style="flex: 1 1 0px; text-align: center; display: flex; flex-direction: column; align-items: center;"><img src="https://potechius.com/ColorTransferLab/src.png" alt="Source Example" style="width: 220px; max-width: 220px; height: auto; border-radius: 8px; box-shadow: rgba(0, 0, 0, 0.1) 0px 1px 6px;"><div classname="label" style="margin-top: 0.5rem; font-weight: bold;">Source</div></div><div style="flex: 1 1 0px; text-align: center; display: flex; flex-direction: column; align-items: center;"><img src="https://potechius.com/ColorTransferLab/out.png" alt="Output Example" style="width: 220px; max-width: 220px; height: auto; border-radius: 8px; box-shadow: rgba(0, 0, 0, 0.1) 0px 1px 6px;"><div classname="label" style="margin-top: 0.5rem; font-weight: bold;">Output</div></div><div style="flex: 1 1 0px; text-align: center; display: flex; flex-direction: column; align-items: center;"><img src="https://potechius.com/ColorTransferLab/ref.png" alt="Reference Example" style="width: 220px; max-width: 220px; height: auto; border-radius: 8px; box-shadow: rgba(0, 0, 0, 0.1) 0px 1px 6px;"><div classname="label" style="margin-top: 0.5rem; font-weight: bold;">Reference</div></div></div><p><b>Important:</b>&nbsp;You have&nbsp;<b>30 minutes</b>&nbsp;to complete the study. The test is only considered complete if you click the&nbsp;<b>Submit</b>&nbsp;button at the end. Please make sure to answer all tests.<br><br>By clicking&nbsp;<b>Continue</b>, you confirm that you have read and understood the instructions.</p>	rating
\.


--
-- Data for Name: item; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.item (id, test_name, dataset_name, meta) FROM stdin;
275	S0V0C0A2I6_S2V5C0A3I7_RC	TestDataset1	{"source": "S0V0C0A0I2", "Config A": false, "Config B": false, "Config C": true, "algorithm": "Reinhard", "reference": "S1V5C3A1I0"}
276	S0V0C0A2I6_S0V5C0A3I7_RC	TestDataset1	{"source": "S0V0C0A0I2", "Config A": false, "Config B": false, "Config C": true, "algorithm": "Reinhard", "reference": "S1V5C3A1I0"}
277	S0V0C0A1I4_S1V3C2A0I5_E	TestDataset1	{"source": "S0V0C0A0I2", "Config A": false, "Config B": false, "Config C": true, "algorithm": "Reinhard", "reference": "S1V5C3A1I0"}
278	S0V0C0A0I2_S1V5C3A1I0_RA	TestDataset1	{"source": "S0V0C0A0I2", "Config A": false, "Config B": false, "Config C": true, "algorithm": "Reinhard", "reference": "S1V5C3A1I0"}
279	S0V0C0A1I1_S1V5C0A1I0_E	TestDataset1	{"source": "S0V0C0A0I2", "Config A": false, "Config B": false, "Config C": true, "algorithm": "Reinhard", "reference": "S1V5C3A1I0"}
280	S0V0C0A2I3_S0V1C0A3I6_RAB	TestDataset1	{"source": "S0V0C0A0I2", "Config A": false, "Config B": false, "Config C": true, "algorithm": "Reinhard", "reference": "S1V5C3A1I0"}
281	S0V0C0A2I2_S1V5C0A3I1_RBC	TestDataset1	{"source": "S0V0C0A0I2", "Config A": false, "Config B": false, "Config C": true, "algorithm": "Reinhard", "reference": "S1V5C3A1I0"}
282	S0V0C0A2I4_S0V4C3A2I6_EA	TestDataset1	{"source": "S0V0C0A0I2", "Config A": false, "Config B": false, "Config C": true, "algorithm": "Reinhard", "reference": "S1V5C3A1I0"}
283	S0V0C0A2I5_S2V2C2A2I3_EAC	TestDataset1	{"source": "S0V0C0A0I2", "Config A": false, "Config B": false, "Config C": true, "algorithm": "Reinhard", "reference": "S1V5C3A1I0"}
284	S0V0C0A2I5_S2V4C0A1I2_RABC	TestDataset1	{"source": "S0V0C0A0I2", "Config A": false, "Config B": false, "Config C": true, "algorithm": "Reinhard", "reference": "S1V5C3A1I0"}
\.


--
-- Data for Name: metric; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.metric (id, name, min_label, max_label, tooltip, scale) FROM stdin;
34	Naturalness	unnatural	natural	Does the image look realistic and plausible, or does it appear artificial or unnatural?	5
35	Similarity to the reference:	unsimilar	similar	How closely does the output images scene match the color appearance of the reference images scene?	5
36	Artifacts	not many	a lot	Are there any visible errors, distortions, or unwanted effects introduced by the color transfer?	5
37	Overall quality:	bad	good	What is your overall impression of the output image, considering all aspects?	5
\.


--
-- Data for Name: participant; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.participant (id, worker_id, age, gender, nationality, vision, start_time, end_time, test_type, test_link, completion_code, test_number, valid) FROM stdin;
\.


--
-- Data for Name: response; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.response (set_item_id, metric_id, participant_id, value) FROM stdin;
\.


--
-- Data for Name: set; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.set (id, name) FROM stdin;
\.


--
-- Data for Name: set_item; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.set_item (id, set_id, item_id) FROM stdin;
\.


--
-- Name: introduction_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.introduction_id_seq', 4, true);


--
-- Name: item_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.item_id_seq', 284, true);


--
-- Name: metric_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.metric_id_seq', 37, true);


--
-- Name: participant_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.participant_id_seq', 43, true);


--
-- Name: set_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.set_id_seq', 51, true);


--
-- Name: set_item_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.set_item_id_seq', 206, true);


--
-- Name: item item_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.item
    ADD CONSTRAINT item_pkey PRIMARY KEY (id);


--
-- Name: metric metric_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.metric
    ADD CONSTRAINT metric_pkey PRIMARY KEY (id);


--
-- Name: participant participant_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.participant
    ADD CONSTRAINT participant_pkey PRIMARY KEY (id);


--
-- Name: response response_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.response
    ADD CONSTRAINT response_pkey PRIMARY KEY (set_item_id, metric_id, participant_id);


--
-- Name: set_item set_item_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.set_item
    ADD CONSTRAINT set_item_pkey PRIMARY KEY (id);


--
-- Name: set set_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.set
    ADD CONSTRAINT set_pkey PRIMARY KEY (id);


--
-- Name: response response_metric_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.response
    ADD CONSTRAINT response_metric_id_fkey FOREIGN KEY (metric_id) REFERENCES public.metric(id);


--
-- Name: response response_participant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.response
    ADD CONSTRAINT response_participant_id_fkey FOREIGN KEY (participant_id) REFERENCES public.participant(id);


--
-- Name: response response_set_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.response
    ADD CONSTRAINT response_set_item_id_fkey FOREIGN KEY (set_item_id) REFERENCES public.set_item(id);


--
-- Name: set_item set_item_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.set_item
    ADD CONSTRAINT set_item_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.item(id);


--
-- Name: set_item set_item_set_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.set_item
    ADD CONSTRAINT set_item_set_id_fkey FOREIGN KEY (set_id) REFERENCES public.set(id);


--
-- PostgreSQL database dump complete
--

\unrestrict hpDKhkGiosJ7ZpdDfcJWfwibKZoeo2BuvQalhDLnc4pc3z8jLSr9rtC2P5fyvu6

