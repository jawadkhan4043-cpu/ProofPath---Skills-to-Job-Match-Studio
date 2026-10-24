"use client";

import { useEffect, useState, type FormEvent } from "react";

const skillCatalog = [
  "AI literacy",
  "Data analysis",
  "Communication",
  "Project management",
  "Excel",
  "SQL",
  "Python",
  "JavaScript",
  "TypeScript",
  "React",
  "Cloud computing",
  "Cybersecurity",
  "UX design",
  "Research",
  "Customer service",
  "Leadership",
];

const aliases: Record<string, string[]> = {
  "AI literacy": ["ai literacy", "generative ai", "prompt engineering", "prompting"],
  "Data analysis": ["data analysis", "data analytics", "analytics"],
  Communication: ["communication", "written communication", "verbal communication"],
  "Project management": ["project management", "project planning"],
  Excel: ["excel", "spreadsheets"],
  SQL: ["sql"],
  Python: ["python"],
  JavaScript: ["javascript"],
  TypeScript: ["typescript"],
  React: ["react"],
  "Cloud computing": ["cloud computing", "aws", "azure", "google cloud"],
  Cybersecurity: ["cybersecurity", "cyber security", "information security"],
  "UX design": ["ux design", "user experience", "usability"],
  Research: ["research", "user research"],
  "Customer service": ["customer service", "customer support"],
  Leadership: ["leadership", "team leadership"],
};

type Status = "Saved" | "Applied" | "Interview" | "Closed";

type Role = {
  id: string;
  title: string;
  company: string;
  description: string;
  requirements: string[];
  matched: string[];
  gaps: string[];
  fit: number;
  proofCount: number;
  date: string;
  status: Status;
};

const STORAGE_KEY = "proofpath-data";

function findSkills(description: string) {
  const text = description.toLowerCase();
  return skillCatalog.filter((skill) =>
    (aliases[skill] ?? [skill.toLowerCase()]).some((term) => {
      const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return new RegExp(`\\b${escaped}\\b`, "i").test(text);
    }),
  );
}

export default function Home() {
  const [skills, setSkills] = useState<string[]>([]);
  const [proofs, setProofs] = useState<Record<string, string>>({});
  const [roles, setRoles] = useState<Role[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [description, setDescription] = useState("");
  const [analysis, setAnalysis] = useState<Role | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        setSkills(Array.isArray(data.skills) ? data.skills : []);
        setProofs(data.proofs && typeof data.proofs === "object" ? data.proofs : {});
        setRoles(Array.isArray(data.roles) ? data.roles : []);
      }
    } catch {
      // Start with an empty workspace if saved browser data cannot be read.
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ skills, proofs, roles }),
      );
    }
  }, [skills, proofs, roles, loaded]);

  function toggleSkill(skill: string) {
    setSkills((current) =>
      current.includes(skill)
        ? current.filter((item) => item !== skill)
        : [...current, skill],
    );
    setAnalysis(null);
  }

  function analyzeRole(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setAnalysis(null);

    const requirements = findSkills(description);
    if (requirements.length === 0) {
      setError(
        "No supported skills were detected. Try a description mentioning skills such as Excel, communication, SQL, Python, or project management.",
      );
      return;
    }

    const matched = requirements.filter((skill) => skills.includes(skill));
    const gaps = requirements.filter((skill) => !skills.includes(skill));
    const proofCount = matched.filter((skill) => proofs[skill]?.trim()).length;

    setAnalysis({
      id: crypto.randomUUID(),
      title: title.trim() || "Untitled role",
      company: company.trim() || "Company not added",
      description,
      requirements,
      matched,
      gaps,
      fit: Math.round((matched.length / requirements.length) * 100),
      proofCount,
      date: new Date().toLocaleDateString(),
      status: "Saved",
    });
  }

  function saveRole() {
    if (!analysis || roles.some((role) => role.id === analysis.id)) return;
    setRoles((current) => [analysis, ...current]);
  }

  function updateStatus(id: string, status: Status) {
    setRoles((current) =>
      current.map((role) => (role.id === id ? { ...role, status } : role)),
    );
  }

  function removeRole(id: string) {
    setRoles((current) => current.filter((role) => role.id !== id));
  }

  const proofReady = skills.filter((skill) => proofs[skill]?.trim()).length;

  return (
    <main className="shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="ProofPath home">
          <span className="brand-mark">P</span>
          <span>ProofPath <span className="brand-light">Career Studio</span></span>
        </a>
        <span className="privacy-pill"><span /> Saved on this device</span>
      </header>

      <section className="hero">
        <div>
          <p className="eyebrow">MAKE YOUR SKILLS EASIER TO SHOW</p>
          <h1>Find the fit.<br /><em>Build the proof.</em></h1>
          <p className="hero-copy">
            Compare a job description with your skills, spot gaps, and keep
            your applications organized in one private workspace.
          </p>
        </div>
        <div className="hero-card">
          <span className="hero-card-label">YOUR PROOF BOARD</span>
          <div className="hero-metric">
            <strong>{skills.length}</strong><span>skills selected</span>
          </div>
          <div className="hero-metric">
            <strong>{proofReady}</strong><span>with evidence added</span>
          </div>
          <div className="mini-bar">
            <div style={{ width: `${skills.length ? (proofReady / skills.length) * 100 : 0}%` }} />
          </div>
        </div>
      </section>

      <section className="workspace">
        <section className="panel skill-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">STEP 01 · YOUR SKILL PROFILE</p>
              <h2>What can you demonstrate?</h2>
            </div>
            <span className="count-pill">{skills.length} selected</span>
          </div>
          <p className="section-copy">
            Select skills you can honestly discuss. Add a short example, result,
            or portfolio link to make each one easier to prove.
          </p>

          <div className="skill-grid">
            {skillCatalog.map((skill) => {
              const selected = skills.includes(skill);
              return (
                <div className={`skill-card ${selected ? "selected" : ""}`} key={skill}>
                  <label className="skill-toggle">
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleSkill(skill)}
                    />
                    <span className="custom-check">{selected ? "✓" : ""}</span>
                    <span>{skill}</span>
                  </label>
                  {selected && (
                    <input
                      className="proof-input"
                      value={proofs[skill] ?? ""}
                      onChange={(event) =>
                        setProofs((current) => ({
                          ...current,
                          [skill]: event.target.value,
                        }))
                      }
                      placeholder="Add proof: project, result, or link"
                      aria-label={`Evidence for ${skill}`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section className="panel role-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">STEP 02 · ROLE MATCH</p>
              <h2>Analyze a job description</h2>
            </div>
            <span className="step-number">01</span>
          </div>
          <p className="section-copy">
            Paste the description. ProofPath checks it against its built-in
            skill list on this device.
          </p>

          <form className="role-form" onSubmit={analyzeRole}>
            <div className="form-row">
              <label>
                Role title
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="e.g. Junior Data Analyst"
                />
              </label>
              <label>
                Company
                <input
                  value={company}
                  onChange={(event) => setCompany(event.target.value)}
                  placeholder="e.g. Northstar Labs"
                />
              </label>
            </div>
            <label>
              Job description
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Paste the job description here..."
                rows={7}
                required
              />
            </label>
            <button className="primary-button" type="submit">
              Analyze skill fit <span>→</span>
            </button>
          </form>

          {error && <div className="error-box" role="alert">{error}</div>}

          {analysis && (
            <div className="analysis">
              <div className="analysis-header">
                <div>
                  <p className="eyebrow">YOUR TRANSPARENT MATCH</p>
                  <h3>{analysis.title}</h3>
                  <p className="company-name">{analysis.company}</p>
                </div>
                <div className="fit-score">
                  <strong>{analysis.fit}%</strong>
                  <span>skill overlap</span>
                </div>
              </div>

              <p className="match-note">
                This is a keyword comparison, not an employer score or hiring prediction.
              </p>

              <div className="match-columns">
                <div>
                  <h4>Your selected skills</h4>
                  {analysis.matched.length ? (
                    <div className="tag-list">
                      {analysis.matched.map((skill) => (
                        <span className="tag good" key={skill}>✓ {skill}</span>
                      ))}
                    </div>
                  ) : <p className="empty-line">No selected skills matched yet.</p>}
                </div>
                <div>
                  <h4>Skills to build or verify</h4>
                  {analysis.gaps.length ? (
                    <div className="tag-list">
                      {analysis.gaps.map((skill) => (
                        <span className="tag gap" key={skill}>＋ {skill}</span>
                      ))}
                    </div>
                  ) : <p className="empty-line">Every detected skill is selected.</p>}
                </div>
              </div>

              <div className="evidence-line">
                Evidence added for {analysis.proofCount} of {analysis.matched.length} matched skills.
              </div>

              <button
                className="save-button"
                onClick={saveRole}
                disabled={roles.some((role) => role.id === analysis.id)}
              >
                {roles.some((role) => role.id === analysis.id)
                  ? "Added to application tracker"
                  : "Save role to tracker"}
              </button>
            </div>
          )}
        </section>
      </section>

      <section className="tracker">
        <div className="section-heading">
          <div>
            <p className="eyebrow">STEP 03 · KEEP MOMENTUM</p>
            <h2>Application tracker</h2>
          </div>
          <span className="count-pill">{roles.length} roles</span>
        </div>

        {roles.length === 0 ? (
          <div className="tracker-empty">
            <span>↗</span>
            <p>Analyze a role, then save it here to track your next step.</p>
          </div>
        ) : (
          <div className="role-list">
            {roles.map((role) => (
              <article className="role-card" key={role.id}>
                <div className="role-info">
                  <h3>{role.title}</h3>
                  <p>{role.company} · Added {role.date}</p>
                  <div className="role-stats">
                    <span>{role.fit}% skill overlap</span>
                    <span>{role.proofCount}/{role.matched.length} matched skills with proof</span>
                  </div>
                </div>
                <div className="role-actions">
                  <label className="status-label">
                    Status
                    <select
                      value={role.status}
                      onChange={(event) => updateStatus(role.id, event.target.value as Status)}
                    >
                      <option>Saved</option>
                      <option>Applied</option>
                      <option>Interview</option>
                      <option>Closed</option>
                    </select>
                  </label>
                  <button className="remove-button" onClick={() => removeRole(role.id)}>
                    Remove
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <footer className="footer">
        <span>ProofPath · Skills-to-job planning workspace</span>
        <span>Your profile and tracker stay in this browser on this device.</span>
      </footer>
    </main>
  );
}