import React, { useState, useMemo, useEffect, useRef } from 'react';
import { WEB_TYPES, WEB_FEATURES, MKT_TIERS, MKT_CHANNELS, IT_ONE_TIME } from '~/arrays';
import type { ToggleProps, CheckRowProps, AccordionProps, ServiceKey } from '~/lib/aliases';
import type { Dispatch, SetStateAction } from 'react';
import { IoChevronDownOutline } from "react-icons/io5";
import { FaX } from "react-icons/fa6";
import { FaCheck } from "react-icons/fa6";
import { FiPrinter } from "react-icons/fi";
import { IoMdSend } from "react-icons/io";
import { LuRotateCcw } from "react-icons/lu";


const money = (n: number) => `$${Math.round(n).toLocaleString('en-US')}`;
 
function useCountUp(value: number, duration = 450) {
  const [display, setDisplay] = useState(value);
  const rafRef = useRef<number | null>(null);
  const fromRef = useRef(value);

  useEffect(() => {
    const start = performance.now();
    const startVal = fromRef.current;
    const diff = value - startVal;
    if (diff === 0) return;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(startVal + diff * eased);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
      else fromRef.current = value;
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [value]);
  return display;
}
 

function Toggle({ checked, onChange, label }: ToggleProps) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label}
      className={`switch ${checked ? 'on' : ''}`} onClick={onChange}>
      <span className="knob" />
    </button>
  );
}
 
function CheckRow({ label, price, checked, onChange }: CheckRowProps) {
  return (
    <label className="check-row">
      <span className={`box ${checked ? 'checked' : ''}`} onClick={onChange}>
        {checked && <FaCheck size={13} strokeWidth={3} />}
      </span>
      <span className="check-label" onClick={onChange}>{label}</span>
      <span className="check-price mono">+{money(price)}</span>
    </label>
  );
}
 
function Accordion({ id, title, subtitle, open, enabled, onToggleEnabled, onToggleOpen, children }: AccordionProps) {
  return (
    <section className={`card ${enabled ? '' : 'disabled'}`}>
      <div className="card-head">
        <Toggle checked={enabled} onChange={onToggleEnabled} label={`Include ${title}`} />
        <button type="button" className="card-title-btn" onClick={onToggleOpen} disabled={!enabled}>
          <div>
            <div className="card-title display">{title}</div>
            <div className="card-sub">{subtitle}</div>
          </div>
          <IoChevronDownOutline size={18} className={`chev ${open && enabled ? 'open' : ''}`} />
        </button>
      </div>
      <div className={`card-body ${open && enabled ? 'open' : ''}`}>
        <div className="card-body-inner">{children}</div>
      </div>
    </section>
  );
}
 
export default function ServiceEstimator() {
  const quoteNo = useState(() => String(Math.floor(1000 + Math.random() * 8999)))[0];
 
  const [openSection, setOpenSection] = useState('web');
  const [enabled, setEnabled] = useState({ web: true, marketing: false, it: false });
 
  const [webType, setWebType] = useState('business');
  const [pages, setPages] = useState(5);
  const [webFeatures, setWebFeatures] = useState<Record<string, boolean>>({});
  const [rush, setRush] = useState(false);
 
  const [mktTier, setMktTier] = useState('starter');
  const [channels, setChannels] = useState<Record<string, boolean>>({});
  const [adSpend, setAdSpend] = useState(2000);
 
  const [teamSize, setTeamSize] = useState(10);
  const [itItems, setItItems] = useState<Record<string, boolean>>({});
  const [support247, setSupport247] = useState(false);
 
  const [sheetOpen, setSheetOpen] = useState(false);
  const [stamped, setStamped] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [lead, setLead] = useState({ name: '', email: '', company: '' });
 
  const toggleCat = (key: ServiceKey) => setEnabled((p) => ({ ...p, [key]: !p[key] }));
  const toggleOpen = (key: ServiceKey) => setOpenSection((p) => (p === key ? '' : key));
  const toggleMap = (setter: Dispatch<SetStateAction<Record<string, boolean>>>, id: string) => setter((p) => ({ ...p, [id]: !p[id] }));
 
  const webItems = useMemo(() => {
    if (!enabled.web) return [];
    const t = WEB_TYPES.find((x) => x.id === webType);

    if (!t) {
      throw new Error("undefined")
    }

    const items = [{ label: t.label, price: t.price }];
    const extra = Math.max(0, pages - 5);
    if (extra > 0) items.push({ label: `${extra} extra page${extra > 1 ? 's' : ''}`, price: extra * 120 });
    WEB_FEATURES.forEach((f) => { if (webFeatures[f.id]) items.push({ label: f.label, price: f.price }); });
    if (rush) {
      const sub = items.reduce((s, i) => s + i.price, 0);
      items.push({ label: 'Rush delivery (+25%)', price: Math.round(sub * 0.25) });
    }
    return items;
  }, [enabled.web, webType, pages, webFeatures, rush]);
 
  const mktItems = useMemo(() => {
    if (!enabled.marketing) return [];
    const t = MKT_TIERS.find((x) => x.id === mktTier);

    if (!t) {
      throw new Error("undefined")
    }

    const items = [{ label: `${t.label} retainer`, price: t.price }];
    MKT_CHANNELS.forEach((c) => { if (channels[c.id]) items.push({ label: c.label, price: c.price }); });
    if (adSpend > 0) items.push({ label: `Ad spend management (15% of ${money(adSpend)})`, price: Math.round(adSpend * 0.15) });
    return items;
  }, [enabled.marketing, mktTier, channels, adSpend]);
 
  const itOneTime = useMemo(() => {
    if (!enabled.it) return [];
    const items = [{ label: `Onboarding — ${teamSize} seats`, price: 500 + teamSize * 40 }];
    IT_ONE_TIME.forEach((s) => { if (itItems[s.id]) items.push({ label: s.label, price: s.price }); });
    return items;
  }, [enabled.it, teamSize, itItems]);
 
  const itMonthly = useMemo(() => {
    if (!enabled.it) return [];
    const items = [{ label: `Device & user management — ${teamSize} seats`, price: teamSize * 15 }];
    if (support247) items.push({ label: '24/7 support plan', price: 500 });
    return items;
  }, [enabled.it, teamSize, support247]);
 
  const oneTimeItems = [...webItems, ...itOneTime];
  const monthlyItems = [...mktItems, ...itMonthly];
  const oneTimeTotal = oneTimeItems.reduce((s, i) => s + i.price, 0);
  const monthlyTotal = monthlyItems.reduce((s, i) => s + i.price, 0);
  const dueToday = oneTimeTotal + monthlyTotal;
  const dueDisplay = useCountUp(dueToday);
  const isEmpty = oneTimeItems.length === 0 && monthlyItems.length === 0;
 
  const reset = () => {
    setEnabled({ web: true, marketing: false, it: false });
    setWebType('business'); setPages(5); setWebFeatures({}); setRush(false);
    setMktTier('starter'); setChannels({}); setAdSpend(2000);
    setTeamSize(10); setItItems({}); setSupport247(false);
    setStamped(false); setSubmitted(false); setLead({ name: '', email: '', company: '' });
  };
 
  const receipt = (
    <div className="receipt">
      <button type="button" className="receipt-close" onClick={() => setSheetOpen(false)} aria-label="Close quote">
        <FaX size={18} />
      </button>
      <div className="receipt-perf top" />
      <div className="receipt-pad">
        <div className="receipt-head">
          <span className="eyebrow">QUOTE No. {quoteNo}</span>
          <h3 className="display">Estimate</h3>
          <span className="receipt-date mono">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' })}</span>
        </div>
 
        {isEmpty ? (
          <div className="empty-state">
            <p>Your quote is empty.</p>
            <p className="muted">Turn on a service on the left to start building it.</p>
          </div>
        ) : (
          <>
            {oneTimeItems.length > 0 && (
              <div className="line-group">
                <div className="group-label mono">ONE-TIME</div>
                {oneTimeItems.map((it, i) => (
                  <div className="line-item" key={`ot-${i}`}>
                    <span className="line-label">{it.label}</span>
                    <span className="leader" />
                    <span className="line-price mono">{money(it.price)}</span>
                  </div>
                ))}
                <div className="subtotal mono">
                  <span>Subtotal</span><span>{money(oneTimeTotal)}</span>
                </div>
              </div>
            )}
 
            {monthlyItems.length > 0 && (
              <div className="line-group">
                <div className="group-label mono">MONTHLY</div>
                {monthlyItems.map((it, i) => (
                  <div className="line-item" key={`mo-${i}`}>
                    <span className="line-label">{it.label}</span>
                    <span className="leader" />
                    <span className="line-price mono">{money(it.price)}</span>
                  </div>
                ))}
                <div className="subtotal mono">
                  <span>Subtotal / mo</span><span>{money(monthlyTotal)}</span>
                </div>
              </div>
            )}
 
            <div className="receipt-perf mid" />
 
            <div className="total-block">
              <span className="total-label">DUE TODAY</span>
              <span className="total-number display">{money(dueDisplay)}</span>
              {monthlyTotal > 0 && <span className="then mono">then {money(monthlyTotal)}/mo after</span>}
            </div>
          </>
        )}
 
        {!isEmpty && !stamped && (
          <button type="button" className="stamp-btn" onClick={() => setStamped(true)}>
            <span className="stamp-mark">✦</span> STAMP &amp; GET QUOTE
          </button>
        )}
 
        {stamped && !submitted && (
          <form className="lead-form" onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}>
            <label>
              Name
              <input required value={lead.name} onChange={(e) => setLead({ ...lead, name: e.target.value })} placeholder="Jane Doe" />
            </label>
            <label>
              Email
              <input required type="email" value={lead.email} onChange={(e) => setLead({ ...lead, email: e.target.value })} placeholder="jane@company.com" />
            </label>
            <label>
              Company <span className="opt">(optional)</span>
              <input value={lead.company} onChange={(e) => setLead({ ...lead, company: e.target.value })} placeholder="Acme Inc." />
            </label>
            <button type="submit" className="seal-btn"><IoMdSend size={14} /> Seal &amp; send my quote</button>
          </form>
        )}
 
        {submitted && (
          <div className="sealed">
            <div className="stamp-rotate">SEALED</div>
            <p>Your quote is saved to <strong>{lead.email}</strong>. A specialist will follow up within one business day.</p>
            <div className="sealed-actions">
              <button type="button" onClick={() => window.print()}><FiPrinter size={14} /> Save as PDF</button>
              <button type="button" onClick={reset}><LuRotateCcw size={14} /> Start over</button>
            </div>
          </div>
        )}
      </div>
      <div className="receipt-perf bottom" />
    </div>
  );
 
  return (
    <div className="estimator">
      
      <div className="page">
        <header className="hero">
          <span className="eyebrow">CUSTOM SERVICE ESTIMATOR</span>
          <h1>Build your quote.<br />See the number in real time.</h1>
          <p className="sub">Switch on the services you need. Every toggle updates the receipt live — no waiting on a call to find out what this costs.</p>
        </header>
 
        <div className="workspace">
          <div className="configurator">
            <Accordion id="web" title="Web Development" subtitle="Site build, features, timeline"
              open={openSection === 'web'} enabled={enabled.web}
              onToggleEnabled={() => toggleCat('web')} onToggleOpen={() => toggleOpen('web')}>
              <div className="field-group">
                <span className="field-label">Site type</span>
                <div className="type-grid">
                  {WEB_TYPES.map((t) => (
                    <button type="button" key={t.id} className={`type-card ${webType === t.id ? 'active' : ''}`} onClick={() => setWebType(t.id)}>
                      <div className="t-label">{t.label}</div>
                      <div className="t-desc">{t.desc}</div>
                      <div className="t-price mono">from {money(t.price)}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="field-group">
                <span className="field-label">Pages ({pages} total, 5 included)</span>
                <div className="slider-row">
                  <input type="range" min="1" max="20" value={pages} onChange={(e) => setPages(Number(e.target.value))} />
                  <span className="slider-val mono">{pages} pg</span>
                </div>
              </div>
              <div className="field-group">
                <span className="field-label">Add-on features</span>
                {WEB_FEATURES.map((f) => (
                  <CheckRow key={f.id} label={f.label} price={f.price} checked={!!webFeatures[f.id]} onChange={() => toggleMap(setWebFeatures, f.id)} />
                ))}
              </div>
              <div className="rush-row">
                <div>
                  <div className="check-label">Rush delivery</div>
                  <div className="t-desc2">Ready in 10 business days (+25%)</div>
                </div>
                <Toggle checked={rush} onChange={() => setRush((r) => !r)} label="Rush delivery" />
              </div>
            </Accordion>
 
            <Accordion id="marketing" title="Digital Marketing" subtitle="Monthly retainer + channels"
              open={openSection === 'marketing'} enabled={enabled.marketing}
              onToggleEnabled={() => toggleCat('marketing')} onToggleOpen={() => toggleOpen('marketing')}>
              <div className="field-group">
                <span className="field-label">Retainer tier</span>
                <div className="type-grid">
                  {MKT_TIERS.map((t) => (
                    <button type="button" key={t.id} className={`type-card ${mktTier === t.id ? 'active' : ''}`} onClick={() => setMktTier(t.id)}>
                      <div className="t-label">{t.label}</div>
                      <div className="t-desc">{t.desc}</div>
                      <div className="t-price mono">{money(t.price)}/mo</div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="field-group">
                <span className="field-label">Channels</span>
                {MKT_CHANNELS.map((c) => (
                  <CheckRow key={c.id} label={c.label} price={c.price} checked={!!channels[c.id]} onChange={() => toggleMap(setChannels, c.id)} />
                ))}
              </div>
              <div className="field-group">
                <span className="field-label">Monthly ad spend — {money(adSpend)} <span style={{ color: '#5f5b52' }}>(billed direct to platforms; we manage it)</span></span>
                <div className="slider-row">
                  <input type="range" min="0" max="10000" step="250" value={adSpend} onChange={(e) => setAdSpend(Number(e.target.value))} />
                  <span className="slider-val mono">{money(adSpend)}</span>
                </div>
              </div>
            </Accordion>
 
            <Accordion id="it" title="IT Setup & Infrastructure" subtitle="Onboarding, security, ongoing support"
              open={openSection === 'it'} enabled={enabled.it}
              onToggleEnabled={() => toggleCat('it')} onToggleOpen={() => toggleOpen('it')}>
              <div className="field-group">
                <span className="field-label">Team size ({teamSize} people)</span>
                <div className="slider-row">
                  <input type="range" min="1" max="50" value={teamSize} onChange={(e) => setTeamSize(Number(e.target.value))} />
                  <span className="slider-val mono">{teamSize} ppl</span>
                </div>
              </div>
              <div className="field-group">
                <span className="field-label">One-time services</span>
                {IT_ONE_TIME.map((s) => (
                  <CheckRow key={s.id} label={s.label} price={s.price} checked={!!itItems[s.id]} onChange={() => toggleMap(setItItems, s.id)} />
                ))}
              </div>
              <div className="rush-row">
                <div>
                  <div className="check-label">24/7 support plan</div>
                  <div className="t-desc2">Monitored coverage, all hours (+$500/mo)</div>
                </div>
                <Toggle checked={support247} onChange={() => setSupport247((s) => !s)} label="24/7 support plan" />
              </div>
            </Accordion>
          </div>
 
          <aside className={`receipt-wrap ${sheetOpen ? 'open' : ''}`}>
            {receipt}
          </aside>
        </div>
      </div>
 
      <button type="button" className="mobile-fab" onClick={() => setSheetOpen(true)}>
        <span>View quote</span>
        <span>{money(dueToday)}{monthlyTotal > 0 ? ` + ${money(monthlyTotal)}/mo` : ''}</span>
      </button>
    </div>
  );
}
 