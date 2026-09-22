import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalculator,
  faChartLine,
  faCircleInfo,
  faEnvelope,
  faEye,
  faEyeSlash,
  faFileExport,
  faHouse,
  faLandmark,
  faMoon,
  faRightFromBracket,
  faSun,
  faTableList,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import "./App.css";
import "./effects.css";
import Brand from "./assets/components/Brand.jsx";
import ShieldCheck from "./assets/components/ShieldCheck.jsx";
import Footer from "./assets/components/Footer.jsx";

// Password fields render as plain text inputs whose displayed value is
// starred out (instead of relying on the browser's native "•" masking, which
// can't be restyled), while the real value is tracked separately. This
// derives the correct real value from any edit — typed, pasted, or
// deleted — anywhere in the field, not just at the end.
const maskedInputProps = (realValue, setRealValue, visible) => ({
  type: "text",
  value: visible ? realValue : "*".repeat(realValue.length),
  onChange: (event) => {
    if (visible) {
      setRealValue(event.target.value);
      return;
    }
    const displayed = event.target.value;
    const insertedRun = displayed.replace(/\*/g, "");
    const cursorPos = event.target.selectionStart ?? displayed.length;
    const insertionPoint = Math.max(0, cursorPos - insertedRun.length);
    const removedCount = Math.max(0, realValue.length + insertedRun.length - displayed.length);
    setRealValue(
      realValue.slice(0, insertionPoint) + insertedRun + realValue.slice(insertionPoint + removedCount),
    );
  },
});

const slides = [
  [
    "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1800&q=85",
    "A collaborative banking team",
  ],
  [
    "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1800&q=85",
    "Our people at work",
  ],
  [
    "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1800&q=85",
    "Bharat De Bank office",
  ],
];

const leaders = [
  [
    "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=700&q=80",
    "Arun Mehta",
    "Chairman & Managing Director",
  ],
  [
    "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=700&q=80",
    "Ananya Rao",
    "Chief Risk Officer",
  ],
  [
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=700&q=80",
    "Kavita Nair",
    "Chief Financial Officer",
  ],
  [
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=700&q=80",
    "Rohan Iyer",
    "Chief Technology Officer",
  ],
];

function Nav({ page, setPage, light, setLight }) {
  const [open, setOpen] = useState(false);
  const navRef = useRef(null);
  const go = (p) => {
    setPage(p);
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return;
    const closeIfOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", closeIfOutside);
    return () => document.removeEventListener("mousedown", closeIfOutside);
  }, [open]);

  return (
    <nav ref={navRef}>
      <button
        className="hamburger"
        onClick={() => setOpen(!open)}
        aria-label="Menu"
      >
        ☰
      </button>
      {open && (
        <div className="menu">
          <button
            className={"glow-link " + (page === "home" ? "active" : "")}
            onClick={() => go("home")}
          >
            <FontAwesomeIcon icon={faHouse} fixedWidth /> <span>Home</span>
          </button>
          <button
            className={"glow-link " + (page === "about" ? "active" : "")}
            onClick={() => go("about")}
          >
            <FontAwesomeIcon icon={faCircleInfo} fixedWidth /> <span>About</span>
          </button>
          <button
            className={"glow-link " + (page === "contact" ? "active" : "")}
            onClick={() => go("contact")}
          >
            <FontAwesomeIcon icon={faEnvelope} fixedWidth /> <span>Contact Information</span>
          </button>
          <button className="glow-link" onClick={() => setLight(!light)}>
            <FontAwesomeIcon icon={light ? faSun : faMoon} fixedWidth />{" "}
            <span>{light ? "Dark mode" : "Light mode"}</span>
          </button>
        </div>
      )}
    </nav>
  );
}

function Login({ onLogin, onForgot, passwordValue }) {
  const [show, setShow] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [locating, setLocating] = useState(false);
  const resolveLocation = async (position) => {
    const { latitude, longitude } = position.coords;
    const response = await fetch(
      "https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=" +
        encodeURIComponent(latitude) +
        "&lon=" +
        encodeURIComponent(longitude) +
        "&zoom=10",
    );
    if (!response.ok) throw new Error("lookup failed");
    const data = await response.json();
    const a = data.address || {};
    const place = a.city || a.town || a.village || a.county || a.suburb;
    const district = a.state_district || a.county || a.district;
    const state = a.state;
    if (!place || !district || !state) throw new Error("incomplete location");
    return [place, district, state]
      .filter((value, index, values) => values.indexOf(value) === index)
      .join(", ");
  };
  const completeLogin = (location) => {
    onLogin({
      time: new Date().toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "medium",
      }),
      location,
    });
  };
  const submit = (e) => {
    e.preventDefault();
    if (username !== "employee" || password !== passwordValue) {
      setError("Wrong Credentials. Please enter correct username or password.");
      return;
    }
    setError("");
    // Location is shown on the profile when available, but access to it is
    // never required to sign in — any denial or failure just shows "Unavailable".
    if (!navigator.geolocation) {
      completeLogin("Unavailable");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        let location = "Unavailable";
        try {
          location = await resolveLocation(position);
        } catch {
          location = "Unavailable";
        }
        setLocating(false);
        completeLogin(location);
      },
      () => {
        setLocating(false);
        completeLogin("Unavailable");
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  };
  return (
    <main className="login">
      <div className="ai-orb" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
      <section className="hero">
        <p>NPA INTELLIGENCE PLATFORM</p>
        <h1>
          CHETNA FORECASTING
          <br />
          SYSTEM
        </h1>
      </section>
      <form className="panel" onSubmit={submit}>
        <h2>
          <ShieldCheck /> ENTER CREDENTIALS
        </h2>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          required
        />
        <div className="password">
          <input
            {...maskedInputProps(password, setPassword, show)}
            placeholder="Password"
            required
          />
          <button
            type="button"
            className={"glow-link " + (show ? "active" : "")}
            onClick={() => setShow(!show)}
            aria-label={show ? "Hide password" : "Show password"}
          >
            <FontAwesomeIcon icon={show ? faEye : faEyeSlash} />
          </button>
        </div>
        <button type="button" className="link" onClick={onForgot}>
          <b>Forgot Password?</b>
        </button>
        <button className="primary" type="submit" disabled={locating}>
          {locating ? "Verifying location…" : "Access Secure Portal"}
        </button>
        {error && (
          <p className="login-error" role="alert">
            {error}
          </p>
        )}
      </form>
      <Footer />
    </main>
  );
}

function About() {
  const [i, setI] = useState(0);
  const next = (d) => setI((v) => (v + d + slides.length) % slides.length);
  useEffect(() => {
    const t = setInterval(() => next(1), 5000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    const items = document.querySelectorAll(".about .reveal-on-scroll");
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            observer.unobserve(e.target);
          }
        }),
      { threshold: 0.15 },
    );
    items.forEach((x) => observer.observe(x));
    return () => observer.disconnect();
  }, []);
  const milestones = [
    ["1990", "Founded in Mumbai"],
    ["2001", "First digital branch"],
    ["2011", "National expansion"],
    ["2019", "Risk analytics launch"],
    ["Today", "Banking with insight"],
  ];
  return (
    <main className="about">
      <section className="carousel">
        <div
          className="slide-track"
          style={{ transform: "translateX(-" + i * 100 + "%)" }}
        >
          {slides.map(([src, alt]) => (
            <img src={src} alt={alt} key={src} />
          ))}
        </div>
        <div className="shade" />
        <div className="caption">
          <p>SINCE 1990</p>
          <h1>
            Trusted banking,
            <br />
            built around people.
          </h1>
        </div>
        <button className="arrow left" onClick={() => next(-1)}>
          ‹
        </button>
        <button className="arrow right" onClick={() => next(1)}>
          ›
        </button>
        <div className="dots">
          {slides.map((_, x) => (
            <button
              onClick={() => setI(x)}
              className={x === i ? "chosen" : ""}
              key={x}
            />
          ))}
        </div>
      </section>
      <section className="section journey reveal-on-scroll">
        <video
          className="journey-video"
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
        >
          <source src="/BharatDeVideo.mp4" type="video/mp4" />
        </video>
        <div className="journey-scrim" aria-hidden="true" />
        <div className="journey-content">
          <p className="kicker">OUR HERITAGE</p>
          <h2>Our Journey</h2>
          <p className="lede">
            Bharat De Bank began in 1990 with a simple conviction: meaningful
            banking is built on enduring relationships. From one local branch to
            a trusted national institution, we have paired the discipline of
            sound banking with a belief in human potential. Today, our teams
            support families, businesses and communities with transparent
            products, careful stewardship and technology that makes every
            financial decision more informed.
          </p>
          <div className="timeline">
            {milestones.map((x) => (
              <article key={x[0]}>
                <b>{x[0]}</b>
                <i />
                <p>{x[1]}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="section management reveal-on-scroll">
        <p className="kicker">LEADERSHIP</p>
        <h2>Top Management</h2>
        <div className="leaders">
          {leaders.map((x) => (
            <article key={x[1]}>
              <img src={x[0]} alt={x[1]} />
              <div>
                <h3>{x[1]}</h3>
                <p>{x[2]}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
      <Footer />
    </main>
  );
}

function Contact() {
  const [sent, setSent] = useState(false);
  return (
    <main className="contact">
      <section className="contactHero">
        <p className="kicker">WE ARE HERE TO HELP</p>
        <h1>Contact Information</h1>
        <p>
          Share your query, feedback or thought. Our relationship team will be
          in touch.
        </p>
      </section>
      <section className="formCard">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
          }}
        >
          <label>
            Full name
            <input required placeholder="Your name" />
          </label>
          <label>
            Contact details
            <input required placeholder="Email address or phone number" />
          </label>
          <label>
            Occupation
            <input placeholder="Your occupation" />
          </label>
          <label>
            Your message
            <textarea required rows="5" placeholder="Your Thoughts" />
          </label>
          <button className="primary">Send message</button>
          {sent && (
            <p className="sent">Thank you. Your message has been recorded.</p>
          )}
        </form>
      </section>
      <Footer />
    </main>
  );
}

const profile = [
  ["Original Name", "Aarav Sharma"],
  ["Username", "employee"],
  ["Email Address", "xyz@email.com"],
  ["Unique Employee ID", "BDB-EMP-02149", true],
  ["Date of Birth", "14 September 1992"],
  ["PAN", "BHCPS4821M", true],
  ["AADHAR", "8432 0987 6145", true],
  ["Department", "Risk Management"],
  ["Position", "Credit Risk Analyst"],
  ["Branch", "Bharat De Bank · Mumbai Fort"],
];

/* =========================================================
   PORTFOLIO WORKBOOK — TEMPLATE, UPLOAD & PARSING
   No account data is hardcoded; the loan book is populated
   entirely from an uploaded .xlsx workbook at runtime.
   ========================================================= */

// Matches the column headers of npa_predictive_provisioning_dataset
// (NPA Dataset and Blueprint) exactly, so a downloaded template can be
// filled in the same shape as that reference dataset and re-uploaded as-is.
const excelHeaders = [
  "account_id",
  "customer_id",
  "customer_name",
  "customer_type",
  "product_type",
  "sector",
  "state",
  "branch_code",
  "relationship_manager_id",
  "sanction_date",
  "disbursement_date",
  "maturity_date",
  "tenure_months",
  "sanctioned_amount",
  "outstanding_amount",
  "interest_rate_pct",
  "repayment_frequency",
  "collateral_secured",
  "collateral_type",
  "collateral_value",
  "collateral_last_valuation_days_ago",
  "restructured_flag",
  "restructure_count",
  "bureau_score",
  "bureau_score_3m_change",
  "existing_relationship_years",
  "kyc_risk_category",
  "cross_bank_dpd_reported",
  "current_ratio",
  "dscr",
  "leverage_ratio",
  "dpd_days",
  "bounce_count_6m",
  "limit_utilization_pct",
  "irac_category",
  "irac_subcategory",
  "ecl_stage",
  "irac_provision_rate",
  "irac_floor_provision",
  "pd_30d",
  "pd_60d",
  "pd_90d",
  "pd_180d",
  "lgd_estimate",
  "ead",
  "ecl_estimated_provision",
  "recommended_provision",
  "risk_score_100",
  "ews_signal_count_90d",
  "ews_primary_signal",
  "ews_severity",
  "npa_alert_flag",
  "sma_watch_flag",
  "ews_alert_flag",
  "any_alert_flag",
  "alert_priority",
  "alert_reason",
  "needs_review",
  "approval_status",
  "override_reason",
  "macro_repo_rate_at_sanction",
  "model_version",
  "snapshot_date",
  // Optional — CRILC return fields, populated only when supplied.
  "pan",
  "cin",
  "lei",
  "non_fund_based_exposure",
  "wilful_defaulter_flag",
  "rfa_flag",
  "written_off_amount",
  "written_off_date",
  "npa_classification_date",
  "current_account_closing_balance",
  "current_account_type",
  "quarterly_credit_turnover",
  "quarterly_debit_turnover",
];

const downloadExcelTemplate = async () => {
  const XLSX = await import("xlsx");
  const worksheet = XLSX.utils.aoa_to_sheet([excelHeaders]);
  worksheet["!cols"] = excelHeaders.map(() => ({ wch: 24 }));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Loan Portfolio");
  XLSX.writeFile(workbook, "bharat-de-portfolio-template.xlsx");
};

const downloadCsvTemplate = () => {
  const csv = excelHeaders.map((header) => '"' + header.replaceAll('"', '""') + '"').join(",");
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  link.download = "bharat-de-portfolio-template.csv";
  link.click();
  URL.revokeObjectURL(link.href);
};

const normalizeKey = (key) =>
  String(key || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

// Exact-match pass first (fast, unambiguous), then a fuzzy substring pass —
// real-world exports rarely use our exact header text (e.g. "Borrower Name"
// instead of "Name", "Loan Amount" instead of "Disbursed / Sanctioned
// Amount"), so a narrow single-alias match was silently defaulting almost
// every field on real files.
const findField = (row, ...aliases) => {
  const entries = Object.entries(row).map(([key, value]) => [key, normalizeKey(key), value]);

  for (const alias of aliases) {
    const match = entries.find(([, normalized]) => normalized === alias);
    if (match && String(match[2]).trim() !== "") return match[2];
  }

  for (const alias of aliases) {
    if (alias.length < 6) continue; // too short/generic to fuzzy-match safely (e.g. "pd", "sma", "type", "name")
    const match = entries.find(
      ([, normalized]) =>
        normalized.includes(alias) || (normalized.length >= 5 && alias.includes(normalized)),
    );
    if (match && String(match[2]).trim() !== "") return match[2];
  }

  return "";
};

const toNumber = (value, fallback = 0) => {
  if (value === "" || value === null || value === undefined) return fallback;
  const cleaned = String(value).replace(/[^0-9.-]/g, "");
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const parseEwsSignals = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return [];
  return raw
    .split(";")
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => {
      const [type, severity, date] = chunk.split(":").map((part) => (part || "").trim());
      const severityLower = (severity || "").toLowerCase();
      return {
        type: type || "Signal",
        severity: ["high", "medium", "low"].includes(severityLower) ? severityLower : "medium",
        date: date || "",
      };
    });
};

const isTruthy = (value) => /^(y|true|1)/i.test(String(value || "").trim());

// Different spreadsheet exports render date cells differently (DD/MM/YYYY,
// ISO YYYY-MM-DD, or occasionally an untouched Excel serial number). Bring
// any of those into the DD/MM/YYYY convention the rest of the app expects.
const normalizeDateStr = (value) => {
  const str = String(value ?? "").trim();
  const iso = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[3]}/${iso[2]}/${iso[1]}`;
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(str)) return str;
  if (/^\d{4,6}$/.test(str)) {
    // Excel date serial (days since 1899-12-30), in case raw:false didn't convert it.
    const epoch = new Date(Date.UTC(1899, 11, 30));
    const date = new Date(epoch.getTime() + Number(str) * 86400000);
    return formatDdMmYyyy(date);
  }
  return str;
};

const parseDdMmYyyy = (value) => {
  const match = normalizeDateStr(value).match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return null;
  const [, d, m, y] = match;
  return new Date(Number(y), Number(m) - 1, Number(d));
};

function formatDdMmYyyy(date) {
  return (
    String(date.getDate()).padStart(2, "0") +
    "/" +
    String(date.getMonth() + 1).padStart(2, "0") +
    "/" +
    date.getFullYear()
  );
}

const mapRowToRecord = (row, index) => {
  const amount = toNumber(
    findField(
      row,
      "disbursedsanctionedamount",
      "sanctionedamount",
      "disbursedamount",
      "loanamount",
      "principalamount",
      "outstandingamount",
      "amount",
    ),
    0,
  );
  const ead = toNumber(findField(row, "ead", "exposureatdefault"), 0);
  const collateralValue = toNumber(findField(row, "collateralvalue"), 0);
  const dpd = toNumber(findField(row, "dpd", "dpddays", "dayspastdue", "overduedays", "daysoverdue"), 0);

  const securedFlag = findField(row, "collateralsecured", "issecured");
  const security = securedFlag
    ? isTruthy(securedFlag)
      ? "Secured"
      : "Unsecured"
    : String(findField(row, "securedunsecured", "security", "securitytype") || "Not stated");

  const valuationDaysAgo = findField(row, "collaterallastvaluationdaysago", "valuationdaysago");
  const snapshotDate = parseDdMmYyyy(findField(row, "snapshotdate")) || new Date();
  const collateralValuationDate = findField(row, "collateralvaluationdate", "valuationdate", "lastvaluationdate")
    ? normalizeDateStr(findField(row, "collateralvaluationdate", "valuationdate", "lastvaluationdate"))
    : valuationDaysAgo !== ""
      ? formatDdMmYyyy(new Date(snapshotDate.getTime() - toNumber(valuationDaysAgo, 0) * 86400000))
      : "—";

  const providedEmiStatus = findField(row, "emistatus", "repaymentstatus", "installmentstatus");
  const emiStatus = providedEmiStatus
    ? String(providedEmiStatus)
    : dpd > 90
      ? "Defaulted"
      : dpd > 0
        ? "Irregular"
        : "Regular";

  // Datasets vary: some give LGD/PD as a 0-1 fraction, others as an already
  // scaled 0-100 percentage. Treat anything <= 1 (and > 0) as a fraction.
  const asPercent = (raw) => {
    const n = toNumber(raw, 0);
    return n > 0 && n <= 1 ? n * 100 : n;
  };

  const pd30Raw = findField(row, "pd30d");
  const pd60Raw = findField(row, "pd60d");
  const pd90Raw = findField(row, "pd90d");
  const pd180Raw = findField(row, "pd180d");
  const pdProvided = pd30Raw !== "" || pd60Raw !== "" || pd90Raw !== "" || pd180Raw !== "";
  const pdFallback = toNumber(findField(row, "pd", "probabilityofdefault", "pdpercent"), 0);

  const lgd = asPercent(findField(row, "lgd", "lossgivendefault", "lgdpercent", "lgdestimate"));

  const iracFloorProvisionRaw = findField(row, "iracfloorprovision");
  const eclProvisionRaw = findField(row, "eclestimatedprovision", "eclprovision");
  const recommendedProvisionRaw = findField(row, "recommendedprovision");
  const iracRateRaw = findField(row, "iracprovisionrate");
  const riskScore100Raw = findField(row, "riskscore100", "riskscore");

  const primaryEwsSignal = findField(row, "ewsprimarysignal");
  const ewsSignals = findField(row, "ewssignals", "earlywarningsignals", "ewsflags")
    ? parseEwsSignals(findField(row, "ewssignals", "earlywarningsignals", "ewsflags"))
    : primaryEwsSignal && normalizeKey(primaryEwsSignal) !== "none"
      ? [
          {
            type: String(primaryEwsSignal),
            severity: normalizeKey(findField(row, "ewsseverity")) || "medium",
            date: formatDdMmYyyy(snapshotDate),
          },
        ]
      : [];

  return {
    id: String(
      findField(row, "uniqueid", "accountid", "accountnumber", "loanid", "loanaccountno", "customerid") ||
        100000 + index + 1,
    ),
    customerId: String(findField(row, "customerid", "clientid") || ""),
    name: String(
      findField(
        row,
        "name",
        "borrowername",
        "customername",
        "clientname",
        "accountholdername",
        "applicantname",
      ) || "Unnamed borrower",
    ),
    productType: String(
      findField(row, "producttype", "loantype", "loanproduct", "product", "type") || "Other",
    ),
    sector: String(findField(row, "sector", "industry", "industrysector") || "Unclassified"),
    amount,
    security,
    disbursedDate: String(
      normalizeDateStr(
        findField(row, "dateofdisbursement", "disbursementdate", "disbursaldate", "sanctiondate"),
      ) || "Not stated",
    ),
    dpd,
    sma: String(
      findField(row, "smalevel", "sma", "smacategory", "smastage", "iracsubcategory") || "SMA-0",
    ),
    iracCategory: String(findField(row, "iraccategory") || ""),
    score: toNumber(
      findField(row, "creditscore", "score", "cibilscore", "bureauscore"),
      700,
    ),
    collateral: String(
      findField(row, "collateral", "collateraldescription", "securitydescription", "collateraltype") ||
        "None",
    ),
    collateralValuationDate,
    collateralValue,
    emiStatus,
    pd: pdProvided ? asPercent(pd180Raw) : pdFallback,
    pd30: pdProvided ? asPercent(pd30Raw) : null,
    pd60: pdProvided ? asPercent(pd60Raw) : null,
    pd90: pdProvided ? asPercent(pd90Raw) : null,
    pd180: pdProvided ? asPercent(pd180Raw) : null,
    ead: ead || amount,
    lgd,
    branch: String(findField(row, "branch", "branchcode", "branchname") || "Not stated"),
    relationshipManager: String(findField(row, "relationshipmanagerid", "relationshipmanager") || ""),
    customerType: String(findField(row, "customertype") || ""),
    bounceCount6m: (() => {
      const raw = findField(row, "bouncecount6m", "bouncecount");
      return raw !== "" ? toNumber(raw) : null;
    })(),
    utilizationPct: (() => {
      const raw = findField(row, "limitutilizationpct", "utilizationpct");
      return raw !== "" ? toNumber(raw) : null;
    })(),
    guarantor: String(findField(row, "guarantor", "coborrower", "guarantorname") || "None"),
    restructured: isTruthy(findField(row, "restructured", "isrestructured", "restructuredaccount", "restructuredflag")),
    ewsSignals,
    eclStageProvided: String(findField(row, "eclstage") || ""),
    iracFloorProvisionProvided: iracFloorProvisionRaw !== "" ? toNumber(iracFloorProvisionRaw) : null,
    eclProvisionProvided: eclProvisionRaw !== "" ? toNumber(eclProvisionRaw) : null,
    recommendedProvisionProvided: recommendedProvisionRaw !== "" ? toNumber(recommendedProvisionRaw) : null,
    iracProvisionRateProvided: iracRateRaw !== "" ? asPercent(iracRateRaw) : null,
    riskScore100Provided: riskScore100Raw !== "" ? toNumber(riskScore100Raw) : null,
    // CRILC return fields — optional; blank when the upload doesn't supply them.
    pan: String(findField(row, "pan") || ""),
    cin: String(findField(row, "cin") || ""),
    lei: String(findField(row, "lei") || ""),
    nonFundBasedExposure: toNumber(findField(row, "nonfundbasedexposure"), 0),
    wilfulDefaulter: isTruthy(findField(row, "wilfuldefaulterflag", "wilfuldefaulter")),
    rfa: isTruthy(findField(row, "rfaflag", "redflaggedaccount", "rfa")),
    writtenOffAmount: toNumber(findField(row, "writtenoffamount"), 0),
    writtenOffDate: findField(row, "writtenoffdate") ? normalizeDateStr(findField(row, "writtenoffdate")) : "",
    npaClassificationDate: findField(row, "npaclassificationdate")
      ? normalizeDateStr(findField(row, "npaclassificationdate"))
      : "",
    currentAccountBalance: toNumber(findField(row, "currentaccountclosingbalance"), 0),
    currentAccountType: String(findField(row, "currentaccounttype") || ""),
    quarterlyCreditTurnover: toNumber(findField(row, "quarterlycreditturnover"), 0),
    quarterlyDebitTurnover: toNumber(findField(row, "quarterlydebitturnover"), 0),
  };
};

const isCsvFile = (file) =>
  /\.csv$/i.test(file.name || "") || file.type === "text/csv";

// Regional exports commonly use ";" (or occasionally tab) instead of "," —
// sniff the header line so those files don't collapse into one giant column.
const detectCsvDelimiter = (text) => {
  const headerLine = text.split(/\r?\n/, 1)[0] || "";
  const candidates = [",", ";", "\t"];
  let best = ",";
  let bestCount = 0;
  candidates.forEach((candidate) => {
    const count = headerLine.split(candidate).length - 1;
    if (count > bestCount) {
      best = candidate;
      bestCount = count;
    }
  });
  return best;
};

const stripBom = (text) => text.replace(/^﻿/, "");

const readWorkbookRows = async (file) => {
  const XLSX = await import("xlsx");
  const csv = isCsvFile(file);
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        let workbook;
        if (csv) {
          const text = stripBom(String(event.target.result || ""));
          workbook = XLSX.read(text, { type: "string", FS: detectCsvDelimiter(text) });
        } else {
          workbook = XLSX.read(new Uint8Array(event.target.result), { type: "array" });
        }
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        resolve(XLSX.utils.sheet_to_json(sheet, { defval: "", raw: false, dateNF: "dd/mm/yyyy" }));
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(reader.error);
    if (csv) reader.readAsText(file);
    else reader.readAsArrayBuffer(file);
  });
};

const parseWorkbookRecords = async (file) => {
  const rows = await readWorkbookRows(file);
  const records = rows
    .filter((row) => Object.values(row).some((value) => String(value).trim() !== ""))
    .map(mapRowToRecord);
  const unmatched = records.filter((r) => r.name === "Unnamed borrower" && r.amount === 0).length;
  const warning =
    records.length > 0 && unmatched / records.length > 0.3
      ? `${unmatched} of ${records.length} rows could not be matched to Name/Amount columns — check that your file's column headers match the template (e.g. "Name", "Disbursed / Sanctioned Amount").`
      : "";
  return { records, warning };
};

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
    notation: "compact",
  }).format(value || 0);

const percent = (value) => `${Number(value || 0).toFixed(2)}%`;

const isNpa = (record) => {
  const dpd = Number(record.dpd || 0);
  const sma = String(record.sma || "").trim().toUpperCase();
  const iracCategory = String(record.iracCategory || "").trim().toUpperCase();
  return (
    dpd > 90 ||
    iracCategory === "NPA" ||
    sma === "NPA" ||
    sma.includes("SUB-STANDARD") ||
    sma.includes("SUBSTANDARD") ||
    sma.includes("STRESSED") ||
    sma.includes("DOUBTFUL") ||
    sma.includes("LOSS")
  );
};

const riskOf = (record) =>
  isNpa(record) || record.score < 600
    ? "High risk"
    : record.dpd >= 31 || record.sma === "SMA-2" || record.score < 660
      ? "Watchlist"
      : "Safe";

/* =========================================================
   RBI IRAC CLASSIFICATION ENGINE (deterministic, DPD-based)
   ========================================================= */

const iracOrder = [
  "Standard",
  "SMA-0",
  "SMA-1",
  "SMA-2",
  "Sub-standard",
  "Doubtful-1",
  "Doubtful-2",
  "Doubtful-3",
  "Loss",
];

const iracColors = {
  Standard: "#2E9E5B",
  "SMA-0": "#7BAE3F",
  "SMA-1": "#E0A72E",
  "SMA-2": "#E07B2E",
  "Sub-standard": "#D64545",
  "Doubtful-1": "#A63232",
  "Doubtful-2": "#A63232",
  "Doubtful-3": "#A63232",
  Loss: "#6B1F1F",
};

// Uploaded files often already carry a bank-assigned SMA/IRAC status
// column (e.g. "NPA", "Sub-Standard", "SMA-2"). If that value indicates
// worse asset quality than the DPD figure alone would (DPD may be missing,
// stale, or fail to parse on a given file), treat it as a floor rather than
// silently discarding it — otherwise a file that explicitly marks accounts
// as NPA can still render every account as "Standard".
const smaFloor = (record) => {
  const sma = String(record.sma || "").trim().toUpperCase();
  const iracCategory = String(record.iracCategory || "").trim().toUpperCase();
  let floor = null;

  if (sma.includes("LOSS")) floor = "Loss";
  else if (sma.includes("DOUBTFUL")) {
    floor = sma.includes("3") ? "Doubtful-3" : sma.includes("2") ? "Doubtful-2" : "Doubtful-1";
  } else if (
    sma === "NPA" ||
    sma.includes("SUB-STANDARD") ||
    sma.includes("SUBSTANDARD") ||
    sma.includes("STRESSED")
  ) {
    floor = "Sub-standard";
  } else if (sma === "SMA-2" || sma === "SMA2") floor = "SMA-2";
  else if (sma === "SMA-1" || sma === "SMA1") floor = "SMA-1";
  else if (sma === "SMA-0" || sma === "SMA0") floor = "SMA-0";

  // A coarse ground-truth "NPA" flag (some datasets only give Standard/NPA,
  // not a granular sub-stage) still guarantees at least Sub-standard.
  if (
    iracCategory === "NPA" &&
    (!floor || iracOrder.indexOf(floor) < iracOrder.indexOf("Sub-standard"))
  ) {
    floor = "Sub-standard";
  }

  return floor;
};

const classifyIrac = (record) => {
  const dpd = Number(record.dpd || 0);
  let dpdClass;
  if (dpd <= 0) dpdClass = "Standard";
  else if (dpd <= 30) dpdClass = "SMA-0";
  else if (dpd <= 60) dpdClass = "SMA-1";
  else if (dpd <= 90) dpdClass = "SMA-2";
  else {
    const monthsPastNpa = Math.floor((dpd - 90) / 30);
    if (monthsPastNpa < 12) dpdClass = "Sub-standard";
    else if (monthsPastNpa < 24) dpdClass = "Doubtful-1";
    else if (monthsPastNpa < 36) dpdClass = "Doubtful-2";
    else dpdClass = "Doubtful-3";
  }

  const floor = smaFloor(record);
  if (!floor) return dpdClass;
  return iracOrder.indexOf(floor) > iracOrder.indexOf(dpdClass) ? floor : dpdClass;
};

// Two-branch grouping used across the dashboard, provisioning search and
// account tables: Standard (SMA-0/1/2) vs. NPA (Sub-standard/Doubtful/Loss).
const npaBranchClasses = ["Sub-standard", "Doubtful-1", "Doubtful-2", "Doubtful-3", "Loss"];
const inNpaBranch = (record) => npaBranchClasses.includes(classifyIrac(record));

const validStages = ["Stage 1", "Stage 2", "Stage 3"];

// Prefer the bank's own ground-truth figures when the uploaded file supplies
// them; only fall back to our own simplified engine for files that don't
// (e.g. a manually filled template with just the core fields).
const eclStage = (record) => {
  if (validStages.includes(record.eclStageProvided)) return record.eclStageProvided;
  const cls = classifyIrac(record);
  if (cls === "Standard" || cls === "SMA-0") return "Stage 1";
  if (cls === "SMA-1" || cls === "SMA-2") return "Stage 2";
  return "Stage 3";
};

const iracFloorRate = (record) => {
  if (record.iracProvisionRateProvided != null) return record.iracProvisionRateProvided;
  const cls = classifyIrac(record);
  const secured = record.security === "Secured";
  if (cls === "Standard" || cls === "SMA-0" || cls === "SMA-1" || cls === "SMA-2") return 0.4;
  if (cls === "Sub-standard") return secured ? 15 : 25;
  if (cls === "Doubtful-1") return secured ? 25 : 100;
  if (cls === "Doubtful-2") return secured ? 40 : 100;
  return 100;
};

const iracFloorProvision = (record) =>
  record.iracFloorProvisionProvided != null
    ? record.iracFloorProvisionProvided
    : (Number(record.amount || 0) * iracFloorRate(record)) / 100;

const eclProvision = (record) =>
  record.eclProvisionProvided != null
    ? record.eclProvisionProvided
    : (Number(record.pd || 0) / 100) *
      (Number(record.lgd || 0) / 100) *
      Number(record.ead || record.amount || 0);

const recommendedProvision = (record) =>
  record.recommendedProvisionProvided != null
    ? record.recommendedProvisionProvided
    : Math.max(iracFloorProvision(record), eclProvision(record));

/* =========================================================
   PREDICTIVE PD HORIZONS (real per-horizon PD when the file
   supplies it, else a deterministic curve from the base PD)
   ========================================================= */

const pdHorizons = (record) => {
  const hasProvidedHorizons = [record.pd30, record.pd60, record.pd90, record.pd180].some(
    (v) => v != null,
  );
  const base = Math.min(100, Math.max(0, Number(record.pd || 0)));
  const pd30 = hasProvidedHorizons ? Math.round(record.pd30 ?? 0) : Math.round(base * 0.32);
  const pd60 = hasProvidedHorizons ? Math.round(record.pd60 ?? 0) : Math.round(base * 0.55);
  const pd90 = hasProvidedHorizons ? Math.round(record.pd90 ?? 0) : Math.round(base * 0.78);
  const pd180 = hasProvidedHorizons ? Math.round(record.pd180 ?? 0) : Math.round(base);
  const band = (value, horizon) => {
    const spread = 4 + horizon / 25;
    return [Math.max(0, Math.round(value - spread)), Math.min(100, Math.round(value + spread))];
  };
  return [
    { horizon: "30d", value: pd30, band: band(pd30, 30) },
    { horizon: "60d", value: pd60, band: band(pd60, 60) },
    { horizon: "90d", value: pd90, band: band(pd90, 90) },
    { horizon: "180d", value: pd180, band: band(pd180, 180) },
  ];
};

/* =========================================================
   DERIVED BORROWER / ACCOUNT ATTRIBUTES
   ========================================================= */

const customerTypeOf = (record) => {
  if (record.customerType) return record.customerType;
  if (record.sector === "Agriculture") return "Agri";
  if (Number(record.amount || 0) >= 5000000) return "Corporate";
  if (["Housing", "Retail", "Education"].includes(record.sector)) return "Individual";
  return "MSME";
};

const bureauTrendOf = (record) =>
  record.score >= 750 ? "Improving" : record.score >= 650 ? "Stable" : "Declining";

const utilizationOf = (record) => {
  if (record.utilizationPct != null) return Math.round(record.utilizationPct);
  const digits = String(record.id || "").replace(/\D/g, "").slice(-2);
  return 42 + ((Number(digits) || 0) % 48);
};

const bounceCountOf = (record) =>
  record.bounceCount6m != null
    ? record.bounceCount6m
    : Math.min(6, Math.round(Number(record.dpd || 0) / 20));

const relationshipManagerOf = (record) => record.relationshipManager || "RM-" + record.id.slice(-3);

const isValuationStale = (record) => {
  if (!record.collateralValuationDate || record.collateralValuationDate === "—") return false;
  const [d, m, y] = record.collateralValuationDate.split("/").map(Number);
  const valuationDate = new Date(y, m - 1, d);
  const monthsSince = (Date.now() - valuationDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
  return monthsSince > 18;
};

const buildRepaymentHistory = (record) => {
  const emi = Math.max(1000, Math.round(Number(record.amount || 0) / 60));
  const monthsOverdue = Math.min(6, Math.ceil(Number(record.dpd || 0) / 30));
  return [5, 4, 3, 2, 1, 0].map((monthsAgo) => {
    const missed = monthsAgo < monthsOverdue;
    return {
      label: monthsAgo === 0 ? "This month" : `${monthsAgo}mo ago`,
      due: emi,
      paid: missed ? 0 : emi,
      status: missed ? "Missed" : "Paid",
    };
  });
};

const defaultApprovalStatus = (record) => (classifyIrac(record) === "Standard" ? "Not Required" : "Pending");

/* =========================================================
   PORTFOLIO UPLOAD CARD (shared entry point for the workbook)
   ========================================================= */

function PortfolioUploadCard({ onUpload, count, fileName }) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const [busy, setBusy] = useState(false);

  const handleFile = async (file) => {
    if (!file) return;
    setBusy(true);
    setError("");
    setWarning("");
    try {
      const { records: parsed, warning: parseWarning } = await parseWorkbookRecords(file);
      if (parsed.length === 0) {
        setError(
          "No account rows were found in that file. Make sure it matches the template headers.",
        );
      } else {
        if (parseWarning) setWarning(parseWarning);
        onUpload(parsed, file.name);
      }
    } catch {
      setError("Could not read that file. Please upload an .xlsx or .csv file exported from the template.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="upload-card upload-card-wide">
      <div className="card-heading">
        <div>
          <h2>Upload loan portfolio</h2>
          <p>Excel (.xlsx) or CSV (.csv) file · analysed only in this browser session</p>
        </div>
        <div className="template-actions">
          <button type="button" className="demo-button" onClick={downloadExcelTemplate}>
            ⇩ Excel template
          </button>
          <button type="button" className="demo-button" onClick={downloadCsvTemplate}>
            ⇩ CSV template
          </button>
        </div>
      </div>

      <label
        className={"drop-zone " + (dragging ? "is-dragging" : "")}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          handleFile(event.dataTransfer.files[0]);
        }}
      >
        <input
          type="file"
          accept=".xlsx,.xls,.csv,text/csv"
          onChange={(event) => handleFile(event.target.files[0])}
        />
        {busy ? (
          <span className="upload-spinner" aria-hidden="true" />
        ) : (
          <span className="upload-icon">↥</span>
        )}
        <strong>
          {busy ? "Processing…" : "Drop your .xlsx or .csv file here, or click to browse"}
        </strong>
        <small>
          account_id · customer_name · product_type · sector · sanctioned_amount · dpd_days ·
          irac_subcategory · bureau_score and more
        </small>
      </label>

      {error && (
        <p className="login-error" role="alert">
          {error}
        </p>
      )}

      {warning && (
        <p className="upload-warning" role="alert">
          ⚠ {warning}
        </p>
      )}

      <div className="file-tips">
        <b>How it works</b>
        <span>
          Download the Excel or CSV template, fill in one row per loan account, then upload it
          here. Every chart, classification, provisioning figure and report on this dashboard is
          generated live from your file — nothing is pre-loaded.
        </span>
      </div>

      {count > 0 && (
        <p className="upload-status">
          ✓ {count} account{count === 1 ? "" : "s"} loaded from {fileName || "your workbook"}.
          Upload a new file anytime to replace them.
        </p>
      )}
    </section>
  );
}

/* =========================================================
   1. PORTFOLIO DASHBOARD
   ========================================================= */

function PortfolioDashboardView({ records, onUpload, fileName }) {
  if (records.length === 0) {
    return (
      <div className="portfolio-dashboard">
        <div className="dashboard-heading">
          <div>
            <p className="kicker">BOARD SUMMARY</p>
            <h1>Portfolio Dashboard</h1>
            <p>Upload your loan portfolio workbook to populate every metric, chart and report.</p>
          </div>
          <span className="secure-pill">● No portfolio loaded</span>
        </div>
        <PortfolioUploadCard onUpload={onUpload} count={records.length} fileName={fileName} />
      </div>
    );
  }

  const total = records.reduce((sum, r) => sum + Number(r.amount || 0), 0);
  const npaRecords = records.filter(isNpa);
  const grossNpaAmount = npaRecords.reduce((sum, r) => sum + Number(r.amount || 0), 0);
  const grossNpaPct = total > 0 ? (grossNpaAmount / total) * 100 : 0;

  const provisionsHeld = npaRecords.reduce((sum, r) => sum + recommendedProvision(r), 0);
  const netNpaAmount = Math.max(grossNpaAmount - provisionsHeld, 0);
  const netNpaPct = total > 0 ? (netNpaAmount / total) * 100 : 0;
  const pcr = total > 0 ? (provisionsHeld / total) * 100 : 0;

  const headline = [
    { label: "Gross NPA %", value: percent(grossNpaPct), sub: "of total disbursed" },
    { label: "Net NPA %", value: percent(netNpaPct), sub: "of total disbursed" },
    { label: "Provision Coverage Ratio", value: percent(pcr), sub: "of total disbursed" },
  ];

  const inWatchBranch = (record) => ["SMA-1", "SMA-2"].includes(classifyIrac(record));

  const standardBranch = [
    {
      key: "SMA-0",
      count: records.filter((r) => ["Standard", "SMA-0"].includes(classifyIrac(r))).length,
      color: iracColors["SMA-0"],
    },
    { key: "SMA-1", count: records.filter((r) => classifyIrac(r) === "SMA-1").length, color: iracColors["SMA-1"] },
    { key: "SMA-2", count: records.filter((r) => classifyIrac(r) === "SMA-2").length, color: iracColors["SMA-2"] },
  ];
  const npaBranch = [
    {
      key: "Sub-standard",
      count: records.filter((r) => classifyIrac(r) === "Sub-standard").length,
      color: iracColors["Sub-standard"],
    },
    {
      key: "Doubtful",
      count: records.filter((r) => ["Doubtful-1", "Doubtful-2", "Doubtful-3"].includes(classifyIrac(r))).length,
      color: iracColors["Doubtful-1"],
    },
    { key: "Loss", count: records.filter((r) => classifyIrac(r) === "Loss").length, color: iracColors.Loss },
  ];
  const treeMax = Math.max(
    ...standardBranch.map((b) => b.count),
    ...npaBranch.map((b) => b.count),
    1,
  );
  const standardTotal = standardBranch.reduce((sum, b) => sum + b.count, 0);
  const npaTotal = npaBranch.reduce((sum, b) => sum + b.count, 0);

  // red / amber / green tiering shared by the top-risk list and the sector heatmap
  const riskTier = (record) => {
    if (inNpaBranch(record)) return "red";
    if (inWatchBranch(record)) return "amber";
    return "green";
  };

  const sectorMap = {};
  records.forEach((r) => {
    const sector = r.sector || "Other";
    if (!sectorMap[sector]) sectorMap[sector] = { sector, amount: 0, npa: 0, watch: 0, accounts: 0 };
    sectorMap[sector].amount += Number(r.amount || 0);
    sectorMap[sector].accounts += 1;
    if (inNpaBranch(r)) sectorMap[sector].npa += 1;
    else if (inWatchBranch(r)) sectorMap[sector].watch += 1;
  });
  const sectorStress = Object.values(sectorMap).sort((a, b) => b.npa - a.npa || b.amount - a.amount);

  const topRisk = records
    .slice()
    .sort((a, b) => Number(b.pd || 0) - Number(a.pd || 0))
    .slice(0, 5);

  return (
    <div className="portfolio-dashboard">
      <div className="dashboard-heading">
        <div>
          <p className="kicker">BOARD SUMMARY</p>
          <h1>Portfolio Dashboard</h1>
          <p>Headline NPA metrics, classification mix and concentration risk across the loan book.</p>
        </div>
        <span className="secure-pill">● {records.length} accounts live</span>
      </div>

      <PortfolioUploadCard onUpload={onUpload} count={records.length} fileName={fileName} />

      <section className="dashboard-kpi-grid headline-grid-3">
        {headline.map((card) => (
          <article className="dashboard-kpi-card" key={card.label}>
            <p>{card.label}</p>
            <strong>{card.value}</strong>
            <small>{card.sub}</small>
          </article>
        ))}
      </section>

      <section className="risk-panel section-spaced">
        <div className="risk-panel-header">
          <div>
            <span className="risk-eyebrow">IRAC CLASSIFICATION</span>
            <h2>Standard vs. NPA distribution</h2>
            <p>Standard accounts staged by SMA level; NPA accounts staged by asset classification</p>
          </div>
        </div>
        <div className="classification-tree">
          <div className="tree-branch">
            <div className="tree-branch-head">
              <span className="tree-branch-dot standard" />
              <b>Standard</b>
              <span>{standardTotal} accounts</span>
            </div>
            {standardBranch.map((b) => (
              <div
                className="classification-row"
                key={b.key}
                data-tooltip={`${b.key}\n${b.count} of ${standardTotal} standard accounts`}
              >
                <span className="classification-label">{b.key}</span>
                <div className="classification-track">
                  <div
                    className="classification-fill"
                    style={{ width: Math.max(3, (b.count / treeMax) * 100) + "%", "--bar-color": b.color }}
                  />
                </div>
                <span className="classification-count">{b.count}</span>
              </div>
            ))}
          </div>

          <div className="tree-branch">
            <div className="tree-branch-head">
              <span className="tree-branch-dot npa" />
              <b>NPA</b>
              <span>{npaTotal} accounts</span>
            </div>
            {npaBranch.map((b) => (
              <div
                className="classification-row"
                key={b.key}
                data-tooltip={`${b.key}\n${b.count} of ${npaTotal} NPA accounts`}
              >
                <span className="classification-label">{b.key}</span>
                <div className="classification-track">
                  <div
                    className="classification-fill"
                    style={{ width: Math.max(3, (b.count / treeMax) * 100) + "%", "--bar-color": b.color }}
                  />
                </div>
                <span className="classification-count">{b.count}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="risk-chart-grid">
        <div className="risk-panel">
          <div className="risk-panel-header">
            <div>
              <span className="risk-eyebrow">CONCENTRATION</span>
              <h2>Sector-wise stress heatmap</h2>
              <p>Sectors ranked by number of NPAs recorded</p>
            </div>
          </div>
          <div className="stress-heatmap">
            {sectorStress.map((s) => {
              const npaPct = s.accounts > 0 ? (s.npa / s.accounts) * 100 : 0;
              return (
                <div
                  className="heatmap-cell"
                  key={s.sector}
                  style={{ "--npa-pct": npaPct + "%" }}
                >
                  <b>{s.sector}</b>
                  <span>{money(s.amount)}</span>
                  <small>{s.npa} NPA · {s.watch} watch / {s.accounts}</small>
                </div>
              );
            })}
          </div>
        </div>

        <div className="risk-panel">
          <div className="risk-panel-header">
            <div>
              <span className="risk-eyebrow">EARLY WARNING</span>
              <h2>Top risk accounts</h2>
              <p>Highest predicted probability of default</p>
            </div>
          </div>
          <div className="top-risk-list">
            {topRisk.map((r) => {
              const tier = riskTier(r);
              return (
                <div className="top-risk-row" key={r.id}>
                  <span className={"tier-dot tier-" + tier} />
                  <div>
                    <b>
                      {r.name} {tier === "red" && <span className="npa-alert-tag">⚠ NPA</span>}
                    </b>
                    <small>{r.id} · {r.sector}</small>
                  </div>
                  <span className="irac-badge" style={{ background: iracColors[classifyIrac(r)] }}>
                    {classifyIrac(r)}
                  </span>
                  <strong>{Number(r.pd || 0).toFixed(0)}% PD</strong>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

/* =========================================================
   2. ACCOUNTS — 360° VIEW (grouped by product type)
   ========================================================= */

const productGroups = [
  { key: "auto", label: "Auto Loan", types: ["Auto Loan"] },
  { key: "home", label: "Home Loan", types: ["Home Loan"] },
  { key: "personal", label: "Personal Loan", types: ["Personal Loan"] },
  { key: "gold", label: "Gold Loan", types: ["Gold Loan"] },
  { key: "education", label: "Education Loan", types: ["Education Loan"] },
  { key: "creditcard", label: "Credit Card", types: ["Credit Card"] },
  {
    key: "agri",
    label: "Agri Loans",
    types: ["Kisan Credit Card", "Agri Loan", "Agri Loans", "Agriculture Loan", "Agricultural Loan"],
  },
  {
    key: "corporate",
    label: "Corporate Loans",
    types: ["MSME Term Loan", "Corporate Term Loan", "Overdraft", "Cash Credit"],
  },
];

const normalizeProductType = (value) => String(value || "").trim().toLowerCase();

const groupOfRecord = (record) => {
  const pt = normalizeProductType(record.productType);
  return productGroups.find((group) => group.types.some((t) => normalizeProductType(t) === pt));
};

const matchesAccountSearch = (record, normalizedQuery) =>
  record.id.toLowerCase().includes(normalizedQuery) || record.name.toLowerCase().includes(normalizedQuery);

function AccountsView({ records, selectedAccountId, onSelectAccount }) {
  const [selectedGroupKey, setSelectedGroupKey] = useState(null);
  const [query, setQuery] = useState("");

  if (records.length === 0) {
    return (
      <div className="portfolio-dashboard">
        <div className="dashboard-heading">
          <div>
            <p className="kicker">ACCOUNT-LEVEL VIEW</p>
            <h1>Accounts</h1>
            <p>Full 360° profile — borrower, loan, collateral, EWS signals and predictive risk.</p>
          </div>
          <span className="secure-pill">● No portfolio loaded</span>
        </div>
        <div className="risk-panel">
          <div className="risk-empty">
            No portfolio data yet. Upload your workbook from the Portfolio Dashboard tab.
          </div>
        </div>
      </div>
    );
  }

  const selected = records.find((r) => r.id === selectedAccountId);

  if (selected) {
    return (
      <div className="portfolio-dashboard">
        <div className="dashboard-heading">
          <div>
            <p className="kicker">ACCOUNT-LEVEL VIEW</p>
            <h1>Accounts</h1>
            <p>Full 360° profile — borrower, loan, collateral, EWS signals and predictive risk.</p>
          </div>
        </div>

        <button
          type="button"
          className="back-button"
          onClick={() => {
            onSelectAccount(null);
            setQuery("");
          }}
        >
          ← Back to accounts
        </button>

        <Account360 record={selected} />
      </div>
    );
  }

  const normalizedQuery = query.trim().toLowerCase();
  const matches = normalizedQuery ? records.filter((r) => matchesAccountSearch(r, normalizedQuery)) : [];

  const groupStats = productGroups.map((group) => {
    const items = records.filter((r) => groupOfRecord(r)?.key === group.key);
    return {
      ...group,
      items,
      amount: items.reduce((sum, r) => sum + Number(r.amount || 0), 0),
      npa: items.filter(isNpa).length,
    };
  });

  const otherItems = records.filter((r) => !groupOfRecord(r));
  const cards = otherItems.length > 0
    ? [
        ...groupStats,
        {
          key: "other",
          label: "Other",
          items: otherItems,
          amount: otherItems.reduce((sum, r) => sum + Number(r.amount || 0), 0),
          npa: otherItems.filter(isNpa).length,
        },
      ]
    : groupStats;

  if (!selectedGroupKey) {
    return (
      <div className="portfolio-dashboard">
        <div className="dashboard-heading">
          <div>
            <p className="kicker">ACCOUNT-LEVEL VIEW</p>
            <h1>Accounts</h1>
            <p>Search for an account, or choose a product type to browse its accounts.</p>
          </div>
          <span className="secure-pill">● {records.length} accounts</span>
        </div>

        <section className="risk-panel">
          <div className="risk-panel-header">
            <div>
              <span className="risk-eyebrow">ACCOUNT LOOKUP</span>
              <h2>Search for an account</h2>
              <p>Find a customer by Loan ID, Account ID or Customer Name</p>
            </div>
          </div>

          <div className="provisioning-search-row">
            <input
              type="text"
              className="provisioning-search-input"
              placeholder="Search Loan ID / Account ID / Customer Name…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>

          {normalizedQuery &&
            (matches.length === 0 ? (
              <div className="risk-empty">No accounts match “{query}”.</div>
            ) : (
              <div className="provisioning-match-list">
                {matches.slice(0, 12).map((r) => (
                  <button
                    type="button"
                    className="provisioning-match-row"
                    key={r.id}
                    onClick={() => onSelectAccount(r.id)}
                  >
                    <div>
                      <strong>{r.name}</strong>
                      <small>{r.id}</small>
                    </div>
                    <span className="irac-badge" style={{ background: iracColors[classifyIrac(r)] }}>
                      {classifyIrac(r)}
                    </span>
                  </button>
                ))}
                {matches.length > 12 && (
                  <p className="provisioning-match-overflow">
                    +{matches.length - 12} more match{matches.length - 12 === 1 ? "" : "es"} — refine your search
                  </p>
                )}
              </div>
            ))}
        </section>

        <section className="product-card-grid section-spaced">
          {cards.map((card) => (
            <button
              type="button"
              className="product-card"
              key={card.key}
              disabled={card.items.length === 0}
              onClick={() => setSelectedGroupKey(card.key)}
            >
              <h3>{card.label}</h3>
              <strong>{card.items.length}</strong>
              <span>account{card.items.length === 1 ? "" : "s"}</span>
              <small>{money(card.amount)}</small>
              {card.npa > 0 && <em className="product-card-npa">{card.npa} NPA</em>}
            </button>
          ))}
        </section>
      </div>
    );
  }

  const activeCard = cards.find((card) => card.key === selectedGroupKey);
  const groupRecords = activeCard ? activeCard.items : [];

  return (
    <div className="portfolio-dashboard">
      <div className="dashboard-heading">
        <div>
          <p className="kicker">ACCOUNT-LEVEL VIEW</p>
          <h1>{activeCard ? activeCard.label : "Accounts"}</h1>
          <p>Full 360° profile — borrower, loan, collateral, EWS signals and predictive risk.</p>
        </div>
        <span className="secure-pill">● {groupRecords.length} accounts</span>
      </div>

      <button type="button" className="back-button" onClick={() => setSelectedGroupKey(null)}>
        ← Back to product types
      </button>

      <section className="risk-panel risk-table-panel section-spaced">
        <div className="risk-panel-header">
          <div>
            <span className="risk-eyebrow">LOAN BOOK</span>
            <h2>Select an account</h2>
            <p>Click a row to open its full 360° profile</p>
          </div>
        </div>
        <div className="risk-table-wrapper">
          <table className="risk-table selectable-table">
            <thead>
              <tr>
                <th>Borrower</th>
                <th>Amount</th>
                <th>DPD</th>
                <th>Classification</th>
                <th>PD (180d)</th>
              </tr>
            </thead>
            <tbody>
              {groupRecords.map((r) => (
                <tr key={r.id} onClick={() => onSelectAccount(r.id)}>
                  <td>
                    <strong>{r.name}</strong>
                    <small>{r.id}</small>
                  </td>
                  <td>{money(r.amount)}</td>
                  <td>{r.dpd} DPD</td>
                  <td>
                    <span className="irac-badge" style={{ background: iracColors[classifyIrac(r)] }}>
                      {classifyIrac(r)}
                    </span>
                  </td>
                  <td>{Number(r.pd || 0).toFixed(0)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

// Falls back to a composite score (classification severity + DPD, bounces,
// bureau trend, EMI status, restructuring, stale collateral) only when the
// uploaded file doesn't already supply risk_score_100 for the account.
const riskScore100 = (record) => {
  if (record.riskScore100Provided != null) return Math.max(0, Math.min(100, Math.round(record.riskScore100Provided)));
  const idx = iracOrder.indexOf(classifyIrac(record));
  let score = (idx / (iracOrder.length - 1)) * 70;
  if (record.dpd > 90) score += 15;
  else if (record.dpd > 30) score += 8;
  const bounces = bounceCountOf(record);
  if (bounces >= 5) score += 8;
  else if (bounces >= 3) score += 4;
  if (bureauTrendOf(record) === "Declining") score += 5;
  if (record.emiStatus === "Defaulted") score += 10;
  else if (record.emiStatus === "Irregular") score += 4;
  if (record.restructured) score += 3;
  if (isValuationStale(record)) score += 2;
  return Math.max(0, Math.min(100, Math.round(score)));
};

const riskTierOf = (score) =>
  score > 66.6
    ? { label: "RISKY", color: "var(--risk-substandard)" }
    : score > 33.3
      ? { label: "MODERATELY RISKY", color: "var(--risk-sma1)" }
      : { label: "SAFE", color: "var(--risk-standard)" };

function Account360({ record }) {
  const history = buildRepaymentHistory(record);
  const horizons = pdHorizons(record);
  const score = riskScore100(record);
  const tier = riskTierOf(score);
  const repaymentOverdue = history[history.length - 1]?.status === "Missed";
  const maxPd = Math.max(...horizons.map((h) => h.band[1]), 10);
  const stage = eclStage(record);
  const cls = classifyIrac(record);
  const initials = String(record.name || "?")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");

  return (
    <section className="account-360">
      <div className="account-360-head">
        <div className="account-360-identity">
          <span className="account-avatar" style={{ background: iracColors[cls] }}>
            {initials}
          </span>
          <div>
            <p className="kicker">360° PROFILE</p>
            <h2>{record.name}</h2>
            <p>{record.id} · {record.sector} · {customerTypeOf(record)} borrower</p>
          </div>
        </div>
        <div className="account-360-badges">
          <span className="irac-badge" style={{ background: iracColors[cls] }}>{cls}</span>
          <span className="stage-badge">{stage}</span>
        </div>
      </div>

      <div className="account-360-stats">
        <div className="account-stat">
          <span>Sanctioned amount</span>
          <strong>{money(record.amount)}</strong>
        </div>
        <div className="account-stat">
          <span>DPD</span>
          <strong>{record.dpd}</strong>
        </div>
        <div className="account-stat">
          <span>PD (180d)</span>
          <strong>{Number(record.pd || 0).toFixed(0)}%</strong>
        </div>
        <div className="account-stat">
          <span>Security</span>
          <strong>{record.security}</strong>
        </div>
        <div className="account-stat">
          <span>Recommended provision</span>
          <strong>{money(recommendedProvision(record))}</strong>
        </div>
      </div>

      <div className="account-360-grid">
        <div className="definition-card">
          <b>Borrower profile</b>
          <ul className="kv-list">
            <li><span>Customer type</span><strong>{customerTypeOf(record)}</strong></li>
            <li><span>Bureau score</span><strong>{record.score} ({bureauTrendOf(record)})</strong></li>
            <li><span>Guarantor</span><strong>{record.guarantor}</strong></li>
            <li><span>Relationship manager</span><strong>{relationshipManagerOf(record)}</strong></li>
            <li><span>Branch</span><strong>{record.branch}</strong></li>
          </ul>
        </div>

        <div className="definition-card">
          <b>Loan details</b>
          <ul className="kv-list">
            <li><span>Product type</span><strong>{record.productType}</strong></li>
            <li><span>Sanctioned amount</span><strong>{money(record.amount)}</strong></li>
            <li><span>Security</span><strong>{record.security}</strong></li>
            <li><span>Disbursed on</span><strong>{record.disbursedDate}</strong></li>
            <li><span>Utilization</span><strong>{utilizationOf(record)}%</strong></li>
            <li><span>Restructured</span><strong>{record.restructured ? "Yes" : "No"}</strong></li>
          </ul>
        </div>

        <div className="definition-card">
          <b>Collateral</b>
          <ul className="kv-list">
            <li><span>Type</span><strong>{record.collateral}</strong></li>
            <li><span>Security</span><strong>{record.security === "Secured" ? "SECURED" : "UNSECURED"}</strong></li>
            <li><span>Collateral value</span><strong>{money(record.collateralValue)}</strong></li>
            <li><span>Last valuation</span><strong>{record.collateralValuationDate}</strong></li>
            <li>
              <span>Valuation status</span>
              <strong className={isValuationStale(record) ? "flag-stale" : ""}>
                {record.collateralValuationDate === "—" ? "N/A" : isValuationStale(record) ? "Stale — revaluation due" : "Current"}
              </strong>
            </li>
          </ul>
        </div>

        <div className="definition-card">
          <b>Early warning signals</b>
          <div className="ews-dial-wrap">
            <div className="ews-dial" style={{ "--dial-color": tier.color }}>
              <span>{score}</span>
            </div>
            <p className="ews-verdict" style={{ color: tier.color }}>{tier.label}</p>
          </div>
          <ul className="kv-list">
            <li>
              <span>Repayment overdue</span>
              <strong className={repaymentOverdue ? "flag-stale" : ""}>{repaymentOverdue ? "Yes" : "No"}</strong>
            </li>
            <li>
              <span>DPD beyond 90 days</span>
              <strong className={record.dpd > 90 ? "flag-stale" : ""}>{record.dpd > 90 ? "Yes" : "No"}</strong>
            </li>
            <li>
              <span>Bureau score declining</span>
              <strong className={bureauTrendOf(record) === "Declining" ? "flag-stale" : ""}>
                {bureauTrendOf(record) === "Declining" ? "Yes" : "No"}
              </strong>
            </li>
            <li>
              <span>EMI status</span>
              <strong className={record.emiStatus === "Regular" ? "" : "flag-stale"}>{record.emiStatus}</strong>
            </li>
          </ul>
        </div>
      </div>

      <div className="account-360-grid two">
        <div className="definition-card repayment-card">
          <b>Repayment history (last 6 months)</b>
          <div className="repayment-strip">
            {history.map((month) => (
              <div className={"repayment-cell " + (month.status === "Missed" ? "missed" : "paid")} key={month.label}>
                <span>{month.label}</span>
                <b>{month.status}</b>
              </div>
            ))}
          </div>
        </div>

        <div className="definition-card">
          <b>Predictive PD — 30 / 60 / 90 / 180 day horizon</b>
          <div className="pd-chart">
            {horizons.map((h) => (
              <div
                className="pd-bar-column"
                key={h.horizon}
                data-tooltip={`${h.horizon} probability of default\n${h.value}% (confidence band ${h.band[0]}–${h.band[1]}%)`}
              >
                <div className="pd-bar-area">
                  <div
                    className="pd-band"
                    style={{
                      bottom: (h.band[0] / maxPd) * 100 + "%",
                      height: ((h.band[1] - h.band[0]) / maxPd) * 100 + "%",
                    }}
                  />
                  <div className="pd-bar" style={{ height: (h.value / maxPd) * 100 + "%" }} />
                </div>
                <b>{h.value}%</b>
                <span>{h.horizon}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   3. PROVISIONING CALCULATOR
   ========================================================= */

const classificationFilters = ["All", "Standard", "NPA"];

const matchesClassificationFilter = (record, filter) => {
  if (filter === "All") return true;
  const npaBranch = inNpaBranch(record);
  return filter === "NPA" ? npaBranch : !npaBranch;
};

function ProvisioningView({
  records,
  selectedAccountId,
  onSelectAccount,
  approvals,
  setApprovals,
  auditLog,
  setAuditLog,
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [overrideDraft, setOverrideDraft] = useState({});

  const act = (record, status) => {
    const reason = status === "Overridden" ? (overrideDraft[record.id] || "").trim() : "";
    if (status === "Overridden" && !reason) return;
    setApprovals((prev) => ({
      ...prev,
      [record.id]: {
        status,
        approvedBy: "Aarav Sharma",
        overrideReason: reason || null,
        timestamp: new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }),
      },
    }));
    setAuditLog((prev) => [
      {
        id: prev.length + 1,
        accountId: record.id,
        accountName: record.name,
        action: status,
        reason: reason || null,
        actor: "Aarav Sharma",
        timestamp: new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }),
      },
      ...prev,
    ]);
  };

  if (records.length === 0) {
    return (
      <div className="portfolio-dashboard">
        <div className="dashboard-heading">
          <div>
            <p className="kicker">PROVISIONING ENGINE</p>
            <h1>Provisioning Calculator</h1>
            <p>IRAC regulatory floor vs. forward-looking ECL estimate, side by side.</p>
          </div>
          <span className="secure-pill">● No portfolio loaded</span>
        </div>
        <div className="risk-panel">
          <div className="risk-empty">
            No portfolio data yet. Upload your workbook from the Portfolio Dashboard tab.
          </div>
        </div>
      </div>
    );
  }

  const totals = records.reduce(
    (acc, r) => {
      acc.floor += iracFloorProvision(r);
      acc.ecl += eclProvision(r);
      acc.recommended += recommendedProvision(r);
      return acc;
    },
    { floor: 0, ecl: 0, recommended: 0 },
  );

  const normalizedQuery = query.trim().toLowerCase();
  const filtered = records.filter((r) => matchesClassificationFilter(r, filter));
  const matches = normalizedQuery
    ? filtered.filter(
        (r) =>
          r.id.toLowerCase().includes(normalizedQuery) ||
          (r.customerId && r.customerId.toLowerCase().includes(normalizedQuery)) ||
          r.name.toLowerCase().includes(normalizedQuery),
      )
    : [];

  const selected =
    records.find((r) => r.id === selectedAccountId) ||
    matches.find((r) => r.id === selectedAccountId) ||
    (matches.length === 1 ? matches[0] : null);

  return (
    <div className="portfolio-dashboard">
      <div className="dashboard-heading">
        <div>
          <p className="kicker">PROVISIONING ENGINE</p>
          <h1>Provisioning Calculator</h1>
          <p>IRAC regulatory floor vs. forward-looking ECL estimate (PD × LGD × EAD), side by side.</p>
        </div>
        <span className="secure-pill">● Stage 1/2/3 aligned</span>
      </div>

      <section className="dashboard-kpi-grid provisioning-grid">
        <article className="dashboard-kpi-card">
          <p>Total IRAC Floor Provision</p>
          <strong>{money(totals.floor)}</strong>
          <small>Regulatory minimum</small>
        </article>
        <article className="dashboard-kpi-card kpi-exposure">
          <p>Total ECL Estimate</p>
          <strong>{money(totals.ecl)}</strong>
          <small>PD × LGD × EAD</small>
        </article>
        <article className="dashboard-kpi-card kpi-risk">
          <p>Total Recommended Provision</p>
          <strong>{money(totals.recommended)}</strong>
          <small>max(Floor, ECL)</small>
        </article>
      </section>

      <section className="risk-panel section-spaced">
        <div className="risk-panel-header">
          <div>
            <span className="risk-eyebrow">ACCOUNT LOOKUP</span>
            <h2>Search for an account</h2>
            <p>Find a customer by Loan ID, Account ID, Customer ID or name</p>
          </div>
        </div>

        <div className="provisioning-search-row">
          <input
            type="text"
            className="provisioning-search-input"
            placeholder="Search Loan ID / Account ID / Customer ID / Customer Name…"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              onSelectAccount(null);
            }}
          />
          <select
            className="provisioning-filter-select"
            value={filter}
            onChange={(event) => {
              setFilter(event.target.value);
              onSelectAccount(null);
            }}
          >
            {classificationFilters.map((option) => (
              <option value={option} key={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {selected ? (
          (() => {
            const floor = iracFloorProvision(selected);
            const ecl = eclProvision(selected);
            const recommended = recommendedProvision(selected);
            const overlay = recommended > floor + 1;
            return (
              <div className="provisioning-detail">
                <button
                  type="button"
                  className="back-button"
                  onClick={() => {
                    onSelectAccount(null);
                    setQuery("");
                  }}
                >
                  ← {matches.length > 1 ? "Back to matches" : "Clear selection"}
                </button>

                <div className="provisioning-detail-head">
                  <div>
                    <h2>{selected.name}</h2>
                    <p>
                      {selected.id}
                      {selected.customerId ? " · " + selected.customerId : ""} · {selected.sector}
                    </p>
                  </div>
                  <div className="account-360-badges">
                    <span className="irac-badge" style={{ background: iracColors[classifyIrac(selected)] }}>
                      {classifyIrac(selected)}
                    </span>
                    <span className="stage-badge">{eclStage(selected)}</span>
                  </div>
                </div>

                <div className="provisioning-detail-stats">
                  <div className="account-stat">
                    <span>Sanctioned amount</span>
                    <strong>{money(selected.amount)}</strong>
                  </div>
                  <div className="account-stat">
                    <span>IRAC Floor</span>
                    <strong>{money(floor)}</strong>
                  </div>
                  <div className="account-stat">
                    <span>ECL Estimate</span>
                    <strong>{money(ecl)}</strong>
                  </div>
                  <div className="account-stat">
                    <span>Recommended</span>
                    <strong className={overlay ? "risk-table-alert" : ""}>{money(recommended)}</strong>
                    {overlay && <small className="overlay-note">ECL overlay</small>}
                  </div>
                </div>

                {(() => {
                  const state = approvals[selected.id] || { status: defaultApprovalStatus(selected) };
                  return (
                    <div className="provisioning-approval">
                      <div className="risk-panel-header">
                        <div>
                          <span className="risk-eyebrow">SIGN-OFF</span>
                          <h2>Approval</h2>
                          <p>Approve, reject, or override this account's provisioning with a mandatory reason</p>
                        </div>
                        <span className={"approval-status status-" + state.status.toLowerCase().replace(" ", "-")}>
                          {state.status}
                        </span>
                      </div>
                      <div className="approval-actions">
                        <button type="button" className="approve-btn" onClick={() => act(selected, "Approved")}>
                          ✓ Approve
                        </button>
                        <button type="button" className="reject-btn" onClick={() => act(selected, "Rejected")}>
                          ✕ Reject
                        </button>
                      </div>
                      <div className="override-row">
                        <input
                          type="text"
                          placeholder="Override reason (required)"
                          value={overrideDraft[selected.id] || ""}
                          onChange={(e) =>
                            setOverrideDraft((prev) => ({ ...prev, [selected.id]: e.target.value }))
                          }
                        />
                        <button type="button" className="override-btn" onClick={() => act(selected, "Overridden")}>
                          Override
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            );
          })()
        ) : !normalizedQuery ? (
          <div className="risk-empty">
            Search for an account above to view its provisioning details.
          </div>
        ) : matches.length === 0 ? (
          <div className="risk-empty">No accounts match “{query}” in the {filter} filter.</div>
        ) : (
          <div className="provisioning-match-list">
            {matches.slice(0, 12).map((r) => (
              <button
                type="button"
                className="provisioning-match-row"
                key={r.id}
                onClick={() => onSelectAccount(r.id)}
              >
                <div>
                  <strong>{r.name}</strong>
                  <small>
                    {r.id}
                    {r.customerId ? " · " + r.customerId : ""}
                  </small>
                </div>
                <span className="irac-badge" style={{ background: iracColors[classifyIrac(r)] }}>
                  {classifyIrac(r)}
                </span>
              </button>
            ))}
            {matches.length > 12 && (
              <p className="provisioning-match-overflow">
                +{matches.length - 12} more match{matches.length - 12 === 1 ? "" : "es"} — refine your search
              </p>
            )}
          </div>
        )}
      </section>

      <section className="risk-panel section-spaced">
        <div className="risk-panel-header">
          <div>
            <span className="risk-eyebrow">IMMUTABLE AUDIT TRAIL</span>
            <h2>Approval log</h2>
            <p>Append-only record of every sign-off action this session</p>
          </div>
        </div>
        {auditLog.length === 0 ? (
          <div className="risk-empty">No approval actions recorded yet.</div>
        ) : (
          <ul className="audit-log">
            {auditLog.map((entry) => (
              <li key={entry.id}>
                <span className="audit-time">{entry.timestamp}</span>
                <span>
                  <b>{entry.actor}</b> {entry.action.toLowerCase()} the provisioning for{" "}
                  <b>{entry.accountName}</b> ({entry.accountId})
                  {entry.reason ? ` — "${entry.reason}"` : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

/* =========================================================
   CRILC RETURN-READY REPORT
   (Central Repository of Information on Large Credits)
   ========================================================= */

const CRORE = 1e7;
const inCrore = (value) => Number(value || 0) / CRORE;
const crMoney = (value) => `₹${inCrore(value).toFixed(2)} Cr`;
const panFormatValid = (pan) => /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(String(pan || "").trim());

// Collapses the 9-way IRAC ladder into the 4 buckets CRILC reports against.
const assetClassBucket = (record) => {
  const cls = classifyIrac(record);
  if (cls === "Standard" || cls.startsWith("SMA")) return "Standard";
  if (cls.startsWith("Doubtful")) return "Doubtful";
  return cls; // Sub-standard, Loss
};

// DPD bands exactly as the CRILC SMA definition specifies; NPA (>90 DPD)
// falls outside the SMA ladder entirely.
const smaDpdBand = (record) => {
  const dpd = Number(record.dpd || 0);
  if (dpd <= 0) return "Standard";
  if (dpd <= 30) return "SMA-0";
  if (dpd <= 60) return "SMA-1";
  if (dpd <= 90) return "SMA-2";
  return "NPA";
};

const assetClassColors = {
  Standard: "#2e9e5b",
  "Sub-standard": "#d64545",
  Doubtful: "#a63232",
  Loss: "#6b1f1f",
};

const smaDpdColors = {
  Standard: "#2e9e5b",
  "SMA-0": "#7bae3f",
  "SMA-1": "#e0a72e",
  "SMA-2": "#e07b2e",
  NPA: "#d64545",
};

function CrilcReport({ records }) {
  const exportRef = useRef(null);
  const [exporting, setExporting] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  if (records.length === 0) return null;

  // Aggregate exposure = fund-based + non-fund-based + investment exposure.
  // This dataset only carries a fund-based outstanding and an optional
  // non-fund-based column; investment exposure isn't collected.
  const exposureOf = (r) => Number(r.amount || 0) + Number(r.nonFundBasedExposure || 0);
  const qualifying = records
    .filter((r) => exposureOf(r) >= 5 * CRORE)
    .sort((a, b) => exposureOf(b) - exposureOf(a));

  const assetClassData = ["Standard", "Sub-standard", "Doubtful", "Loss"].map((bucket) => ({
    bucket,
    exposure: inCrore(qualifying.filter((r) => assetClassBucket(r) === bucket).reduce((s, r) => s + exposureOf(r), 0)),
    color: assetClassColors[bucket],
  }));

  const smaDpdData = ["Standard", "SMA-0", "SMA-1", "SMA-2", "NPA"].map((band) => ({
    band,
    exposure: inCrore(qualifying.filter((r) => smaDpdBand(r) === band).reduce((s, r) => s + exposureOf(r), 0)),
    color: smaDpdColors[band],
  }));

  const sectorMap = {};
  qualifying.forEach((r) => {
    const sector = r.sector || "Unclassified";
    sectorMap[sector] = (sectorMap[sector] || 0) + exposureOf(r);
  });
  const sectorExposureData = Object.entries(sectorMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([sector, exposure]) => ({ sector, exposure: inCrore(exposure) }));

  const missingPan = qualifying.filter((r) => !panFormatValid(r.pan)).length;
  const missingCin = qualifying.filter((r) => !r.cin).length;
  const missingLei = qualifying.filter((r) => !r.lei).length;
  const nonFundCaptured = qualifying.some((r) => Number(r.nonFundBasedExposure || 0) > 0);

  const checklist = [
    {
      label: "PAN Master Sync",
      pass: missingPan === 0,
      detail:
        missingPan === 0
          ? "All qualifying borrowers carry a valid-format PAN."
          : `${missingPan} of ${qualifying.length} borrowers have a missing or invalid-format PAN.`,
    },
    {
      label: "CIN coverage",
      pass: missingCin === 0,
      detail:
        missingCin === 0
          ? "All qualifying borrowers carry a CIN."
          : `${missingCin} of ${qualifying.length} borrowers are missing a CIN.`,
    },
    {
      label: "LEI coverage",
      pass: missingLei === 0,
      detail:
        missingLei === 0
          ? "All qualifying borrowers carry an LEI."
          : `${missingLei} of ${qualifying.length} borrowers are missing an LEI.`,
    },
    {
      label: "Non-fund based exposure",
      pass: nonFundCaptured,
      detail: nonFundCaptured
        ? "Non-fund based exposure is captured for at least one account."
        : "Not captured in this upload — Section 1 exposure is fund-based only.",
    },
    {
      label: "Unit of measurement",
      pass: true,
      detail: "All monetary figures below are converted to ₹ Crore per CIMS taxonomy convention.",
    },
  ];

  const topFive = qualifying.slice(0, 5);

  const section1Row = (r) => (
    <tr key={r.id}>
      <td>
        <strong>{r.name}</strong>
        <small>{r.id}</small>
      </td>
      <td>{r.pan || "Not stated"}</td>
      <td>{r.cin || "Not stated"}</td>
      <td>{r.lei || "Not stated"}</td>
      <td>{crMoney(r.amount)}</td>
      <td>
        <span className="irac-badge" style={{ background: assetClassColors[assetClassBucket(r)] }}>
          {assetClassBucket(r)}
        </span>
      </td>
      <td>{smaDpdBand(r)}</td>
    </tr>
  );

  // "Show More" doesn't expand the on-screen table — it downloads a PDF of
  // the full qualifying list, built from the always-rendered off-screen sheet.
  const exportSection1 = async () => {
    const node = exportRef.current;
    if (!node) return;
    setExporting(true);
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);
      await new Promise((resolve) => requestAnimationFrame(resolve));
      const canvas = await html2canvas(node, { scale: 2, backgroundColor: "#0b1c33", useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      pdf.save("crilc-section1-large-exposure-report.pdf");
    } finally {
      setExporting(false);
    }
  };

  return (
    <section className="risk-panel crilc-report section-spaced">
      <div className="risk-panel-header crilc-collapse-toggle">
        <div>
          <span className="risk-eyebrow">RBI CIMS / XBRL</span>
          <h2>CRILC Return-Ready Report</h2>
          <p>
            Central Repository of Information on Large Credits — Section 1: Exposure to Large Borrowers
            (aggregate exposure ≥ ₹5 crore).
          </p>
        </div>
        <button
          type="button"
          className="crilc-collapse-icon"
          onClick={() => setCollapsed((c) => !c)}
          aria-expanded={!collapsed}
          aria-label={collapsed ? "Expand report" : "Collapse report"}
        >
          {collapsed ? "▸" : "▾"}
        </button>
      </div>

      {!collapsed && (
        <>
          <div className="dashboard-kpi-grid headline-grid-2">
            <article className="dashboard-kpi-card">
              <p>Qualifying Borrowers</p>
              <strong>{qualifying.length}</strong>
              <small>Aggregate exposure ≥ ₹5 Cr</small>
            </article>
            <article className="dashboard-kpi-card">
              <p>Total Reportable Exposure</p>
              <strong>{crMoney(qualifying.reduce((s, r) => s + exposureOf(r), 0))}</strong>
              <small>Fund + non-fund based</small>
            </article>
          </div>

      <div className="crilc-checklist">
        <b>Validation &amp; technical gates</b>
        <ul>
          {checklist.map((item) => (
            <li key={item.label} className={item.pass ? "pass" : "fail"}>
              <span className="crilc-check-icon">{item.pass ? "✓" : "!"}</span>
              <div>
                <b>{item.label}</b>
                <span>{item.detail}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="crilc-chart-grid">
        <div className="crilc-chart-card">
          <span className="risk-eyebrow">SMA / DPD LADDER</span>
          <h3>Exposure by SMA-DPD band</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={smaDpdData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="crilcSmaLine" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#e0a72e" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#e0a72e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(153,187,221,0.15)" vertical={false} />
              <XAxis dataKey="band" stroke="#8da9c3" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#8da9c3" fontSize={11} tickLine={false} axisLine={false} width={40} />
              <RechartsTooltip
                contentStyle={{ background: "#0b1c33", border: "1px solid rgba(153,187,221,0.3)", borderRadius: 8 }}
                labelStyle={{ color: "#edf4fa" }}
                formatter={(value) => [`₹${value.toFixed(2)} Cr`, "Exposure"]}
              />
              <Line
                type="monotone"
                dataKey="exposure"
                stroke="#e0a72e"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "#e0a72e" }}
                fill="url(#crilcSmaLine)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="crilc-chart-card">
          <span className="risk-eyebrow">CONCENTRATION</span>
          <h3>Sector-wise exposure (top 8)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={sectorExposureData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="crilcSectorArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#63c4ff" stopOpacity={0.55} />
                  <stop offset="100%" stopColor="#63c4ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(153,187,221,0.15)" vertical={false} />
              <XAxis
                dataKey="sector"
                stroke="#8da9c3"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                interval={0}
                angle={-20}
                textAnchor="end"
                height={50}
              />
              <YAxis stroke="#8da9c3" fontSize={11} tickLine={false} axisLine={false} width={40} />
              <RechartsTooltip
                contentStyle={{ background: "#0b1c33", border: "1px solid rgba(153,187,221,0.3)", borderRadius: 8 }}
                labelStyle={{ color: "#edf4fa" }}
                formatter={(value) => [`₹${value.toFixed(2)} Cr`, "Exposure"]}
              />
              <Area type="monotone" dataKey="exposure" stroke="#63c4ff" strokeWidth={2} fill="url(#crilcSectorArea)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="crilc-chart-card">
          <span className="risk-eyebrow">ASSET QUALITY</span>
          <h3>Exposure by asset classification</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={assetClassData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(153,187,221,0.15)" vertical={false} />
              <XAxis dataKey="bucket" stroke="#8da9c3" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#8da9c3" fontSize={11} tickLine={false} axisLine={false} width={40} />
              <RechartsTooltip
                contentStyle={{ background: "#0b1c33", border: "1px solid rgba(153,187,221,0.3)", borderRadius: 8 }}
                labelStyle={{ color: "#edf4fa" }}
                formatter={(value) => [`₹${value.toFixed(2)} Cr`, "Exposure"]}
              />
              <Bar dataKey="exposure" radius={[6, 6, 0, 0]}>
                {assetClassData.map((entry) => (
                  <Cell key={entry.bucket} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>

          <div className="crilc-section-block">
            <span className="risk-eyebrow">SECTION 1</span>
            <h3>Exposure to Large Borrowers</h3>
            <div className="risk-table-wrapper">
              <table className="risk-table">
                <thead>
                  <tr>
                    <th>Borrower</th>
                    <th>PAN</th>
                    <th>CIN</th>
                    <th>LEI</th>
                    <th>Funded Exposure</th>
                    <th>Asset Classification</th>
                    <th>SMA / DPD</th>
                  </tr>
                </thead>
                <tbody>{topFive.map(section1Row)}</tbody>
              </table>
            </div>
            {qualifying.length > 5 && (
              <p className="crilc-table-note">
                Showing top 5 of {qualifying.length} qualifying borrowers by exposure.
              </p>
            )}
            <button
              type="button"
              className="run-analysis-button crilc-show-more"
              onClick={exportSection1}
              disabled={exporting}
            >
              {exporting ? "Preparing report…" : "Show More ⇩"}
            </button>
          </div>
        </>
      )}

      {/* Off-screen full Section 1 sheet, captured for the "Show More" PDF download. */}
      <div className="crilc-export-hidden" aria-hidden="true">
        <div className="crilc-export-sheet" ref={exportRef}>
          <h2>Exposure to Large Borrowers (≥ ₹5 Crore)</h2>
          <p>
            CRILC Section 1 — {qualifying.length} qualifying borrowers, generated{" "}
            {new Date().toLocaleDateString("en-IN")}
          </p>
          <table className="risk-table">
            <thead>
              <tr>
                <th>Borrower</th>
                <th>PAN</th>
                <th>CIN</th>
                <th>LEI</th>
                <th>Funded Exposure</th>
                <th>Asset Classification</th>
                <th>SMA / DPD</th>
              </tr>
            </thead>
            <tbody>{qualifying.map(section1Row)}</tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   5. REPORTS & EXPORT
   ========================================================= */

function ReportsView({ records }) {
  return (
    <div className="portfolio-dashboard">
      <div className="dashboard-heading">
        <div>
          <p className="kicker">MIS &amp; REGULATORY</p>
          <h1>Reports &amp; Export</h1>
          <p>CRILC-format large exposure report, return-ready for RBI submission.</p>
        </div>
        <span className="secure-pill">
          ● {records.length > 0 ? records.length + " accounts included" : "No portfolio loaded"}
        </span>
      </div>

      {records.length === 0 && (
        <div className="risk-panel section-spaced">
          <div className="risk-empty">
            No portfolio data yet. Upload your workbook from the Portfolio Dashboard tab.
          </div>
        </div>
      )}

      <CrilcReport records={records} />
    </div>
  );
}

/* =========================================================
   6. OFFICIAL SOURCES
   ========================================================= */

const officialSources = [
  { name: "Discussion Paper on ECL", file: "Discussion Paper on ECL.pdf", logo: "rbi" },
  { name: "ECL Circular (October 2023)", file: "ECL Circular 2023.pdf", logo: "rbi" },
  { name: "ECL Notification (January 2023)", file: "ECL Notification 2023.pdf", logo: "rbi" },
  { name: "Income Recognition and Asset Classification 2025", file: "IRAC 2025.pdf", logo: "rbi" },
  { name: "IRAC Circular 2026 - 1st Notification", file: "IRAC 2026.pdf", logo: "rbi" },
  { name: "IRAC Circular 2026 - 2nd Notification", file: "IRAC 2026 (2).pdf", logo: "rbi" },
  { name: "BASEL III Norms", file: "BASEL III.pdf", logo: "rbi" },
  { name: "Digital Personal Data Protection Act 2023", file: "DPDP Act 2023.pdf", logo: "indgov" },
  { name: "Indian Accounting Standards 109", file: "INDAS109.pdf", logo: "indgov" },
];

const sourceLogos = {
  rbi: "/pdfsources/rbilogo.webp",
  indgov: "/pdfsources/indgov logo.png",
};

function OfficialSourcesView() {
  return (
    <div className="portfolio-dashboard">
      <div className="dashboard-heading">
        <div>
          <p className="kicker">REGULATORY REFERENCE</p>
          <h1>Official Sources</h1>
          <p>RBI and Government of India publications underpinning the classification and provisioning engine.</p>
        </div>
        <span className="secure-pill">● {officialSources.length} documents</span>
      </div>

      <section className="source-card-grid">
        {officialSources.map((source) => (
          <a
            className="source-card"
            key={source.file}
            href={encodeURI("/pdfsources/" + source.file)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="source-card-logo">
              <img src={sourceLogos[source.logo]} alt={source.logo === "rbi" ? "RBI" : "Government of India"} />
            </div>
            <span className="source-card-name">{source.name}</span>
            <small className="source-card-issuer">
              {source.logo === "rbi" ? "Reserve Bank of India" : "Government of India"}
            </small>
          </a>
        ))}
      </section>
    </div>
  );
}

/* =========================================================
   DASHBOARD SHELL
   ========================================================= */

function Dashboard({ light, setLight, onLogout, session }) {
  const [active, setActive] = useState("portfolio");
  const [revealed, setRevealed] = useState({});
  const [records, setRecords] = useState([]);
  const [fileName, setFileName] = useState("");
  const [approvals, setApprovals] = useState({});
  const [auditLog, setAuditLog] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  // Shared across Accounts and Provisioning so looking an account up in one
  // view carries it straight into the other.
  const [selectedAccountId, setSelectedAccountId] = useState(null);

  const handleUpload = (parsedRecords, uploadedFileName) => {
    setRecords(parsedRecords);
    setFileName(uploadedFileName);
    setApprovals({});
    setAuditLog([]);
    setSelectedAccountId(null);
  };

  const nav = [
    ["portfolio", faChartLine, "Portfolio Dashboard"],
    ["accounts", faTableList, "Accounts (360°)"],
    ["provisioning", faCalculator, "Provisioning"],
    ["reports", faFileExport, "Reports & Export"],
    ["sources", faLandmark, "Official Sources"],
    ["profile", faUser, "My Profile"],
  ];

  const go = (id) => {
    setActive(id);
    setMenuOpen(false);
  };

  return (
    <main className="dashboard">
      <button
        type="button"
        className="dashboard-hamburger"
        onClick={() => setMenuOpen((v) => !v)}
        aria-label="Menu"
        aria-expanded={menuOpen}
      >
        ☰
      </button>
      <aside className={"dashboard-side " + (menuOpen ? "is-open" : "")}>
        <Brand />
        <div className="employee-mini">
          <img
            src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=240&q=80"
            alt="Aarav Sharma"
          />
          <div>
            <b>Aarav Sharma</b>
            <span>Credit Risk Analyst</span>
          </div>
        </div>
        <nav className="dashboard-nav">
          {nav.map(([id, icon, label]) => (
            <button
              className={"glow-link " + (active === id ? "active" : "")}
              onClick={() => go(id)}
              key={id}
            >
              <FontAwesomeIcon icon={icon} fixedWidth /> <span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="side-actions">
          <button
            className="glow-link"
            onClick={() => {
              setLight(!light);
              setMenuOpen(false);
            }}
          >
            <FontAwesomeIcon icon={light ? faSun : faMoon} fixedWidth />{" "}
            <span>{light ? "Light mode" : "Dark mode"}</span>
          </button>
          <button
            className="glow-link"
            onClick={() => {
              setMenuOpen(false);
              onLogout();
            }}
          >
            <FontAwesomeIcon icon={faRightFromBracket} fixedWidth /> <span>Sign out</span>
          </button>
        </div>
      </aside>
      {menuOpen && <div className="dashboard-side-scrim" onClick={() => setMenuOpen(false)} />}
      <section className="dashboard-main">
        {active === "portfolio" ? (
          <PortfolioDashboardView records={records} onUpload={handleUpload} fileName={fileName} />
        ) : active === "accounts" ? (
          <AccountsView
            records={records}
            selectedAccountId={selectedAccountId}
            onSelectAccount={setSelectedAccountId}
          />
        ) : active === "provisioning" ? (
          <ProvisioningView
            records={records}
            selectedAccountId={selectedAccountId}
            onSelectAccount={setSelectedAccountId}
            approvals={approvals}
            setApprovals={setApprovals}
            auditLog={auditLog}
            setAuditLog={setAuditLog}
          />
        ) : active === "reports" ? (
          <ReportsView records={records} />
        ) : active === "sources" ? (
          <OfficialSourcesView />
        ) : (
          <>
            <div className="dash-top">
              <div>
                <p className="kicker">EMPLOYEE WORKSPACE</p>
                <h1>Account Profile</h1>
                <p>Review your registered institutional details.</p>
              </div>
              <span className="status">Active</span>
            </div>
            <div className="profile-card">
              <div className="profile-summary">
                <img
                  src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=700&q=80"
                  alt="Aarav Sharma"
                />
                <h2>Aarav Sharma</h2>
                <p>Credit Risk Analyst</p>
                <span>Risk Management · Mumbai Fort</span>
                <div className="login-meta">
                  <small>Last login</small>
                  <b>{session?.time}</b>
                  <small>Login location</small>
                  <b>{session?.location}</b>
                </div>
              </div>
              <div className="profile-data">
                {profile.map(([label, value, sensitive]) => (
                  <div className="profile-row" key={label}>
                    <span>{label}</span>
                    <b>{sensitive && !revealed[label] ? "•••• •••• ••••" : value}</b>
                    {sensitive && (
                      <button
                        onClick={() => setRevealed((v) => ({ ...v, [label]: !v[label] }))}
                        aria-label={"Reveal " + label}
                      >
                        {revealed[label] ? "◉" : "◌"}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </section>
      <Footer />
    </main>
  );
}


function ResetPassword({ onComplete }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState("");
  const submit = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage(
        "Passwords do not match. Please enter the same password in both fields.",
      );
      return;
    }
    setMessage("Successfully Created Password");
    setTimeout(() => onComplete(newPassword), 1200);
  };
  return (
    <main className="reset-page">
      <header className="reset-header">
        <Brand />
      </header>
      <section className="reset-card">
        <p className="kicker">PASSWORD RESET</p>
        <h1>Create new password</h1>
        <p>A reset link has been sent to xyz@email.com in this local demo.</p>
        <form onSubmit={submit}>
          <label>
            New password
            <span className="reset-password">
              <input {...maskedInputProps(newPassword, setNewPassword, showNew)} minLength="8" required />
              <button
                type="button"
                className={"glow-link " + (showNew ? "active" : "")}
                onClick={() => setShowNew(!showNew)}
                aria-label={showNew ? "Hide new password" : "Show new password"}
              >
                <FontAwesomeIcon icon={showNew ? faEye : faEyeSlash} />
              </button>
            </span>
          </label>
          <label>
            Confirm password
            <span className="reset-password">
              <input
                {...maskedInputProps(confirmPassword, setConfirmPassword, showConfirm)}
                minLength="8"
                required
              />
              <button
                type="button"
                className={"glow-link " + (showConfirm ? "active" : "")}
                onClick={() => setShowConfirm(!showConfirm)}
                aria-label={
                  showConfirm
                    ? "Hide confirmed password"
                    : "Show confirmed password"
                }
              >
                <FontAwesomeIcon icon={showConfirm ? faEye : faEyeSlash} />
              </button>
            </span>
          </label>
          <button className="primary" type="submit">
            Create password
          </button>
          {message && (
            <p
              className={
                "reset-message " +
                (message.startsWith("Successfully") ? "success" : "error")
              }
              role="alert"
            >
              {message}
            </p>
          )}
        </form>
      </section>
      <Footer />
    </main>
  );
}

export default function App() {
  const [page, setPage] = useState("home");
  const [authenticated, setAuthenticated] = useState(false);
  const [session, setSession] = useState(null);
  const [passwordValue, setPasswordValue] = useState("Bharat@2026");
  const [light, setLight] = useState(
    () => localStorage.getItem("bharat-de-theme") === "light",
  );
  useEffect(
    () => localStorage.setItem("bharat-de-theme", light ? "light" : "dark"),
    [light],
  );
  if (authenticated)
    return (
      <div className={"app " + (light ? "light " : "")}>
        <Dashboard
          light={light}
          setLight={setLight}
          session={session}
          onLogout={() => setAuthenticated(false)}
        />
      </div>
    );
  if (page === "reset")
    return (
      <div className={"app " + (light ? "light " : "") + "page-reset"}>
        <ResetPassword
          onComplete={(newPassword) => {
            setPasswordValue(newPassword);
            setPage("home");
          }}
        />
      </div>
    );
  return (
    <div className={"app " + (light ? "light " : "") + "page-" + page}>
      <header className="site-header">
        <button className="brandButton" onClick={() => setPage("home")}>
          <Brand />
        </button>
        <Nav {...{ page, setPage, light, setLight }} />
      </header>
      {page === "home" ? (
        <Login
          passwordValue={passwordValue}
          onForgot={() => setPage("reset")}
          onLogin={(loginSession) => {
            setSession(loginSession);
            setAuthenticated(true);
          }}
        />
      ) : page === "about" ? (
        <About />
      ) : (
        <Contact />
      )}
    </div>
  );
}
