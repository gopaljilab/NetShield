import React, { useState } from 'react';
import {
  BookOpen,
  GraduationCap,
  Award,
  Copy,
  Check,
  Shield,
  Cpu,
  FileText,
} from 'lucide-react';
import { useToast } from '../components/common/Toast';

export const AcademicShowcasePage: React.FC = () => {
  const toast = useToast();
  const [copiedBib, setCopiedBib] = useState(false);

  const bibtex = `@inproceedings{moustafa2015unsw,
  title={UNSW-NB15: a comprehensive data set for network intrusion detection systems (UNSW-NB15 network data set)},
  author={Moustafa, Nour and Slay, Jill},
  booktitle={2015 Military Communications and Information Systems Conference (MilCIS)},
  pages={1--6},
  year={2015},
  organization={IEEE},
  doi={10.1109/MilCIS.2015.7348942}
}`;

  const handleCopyBibtex = () => {
    navigator.clipboard.writeText(bibtex);
    setCopiedBib(true);
    toast.success('BibTeX citation copied to clipboard', 'Copied');
    setTimeout(() => setCopiedBib(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Title Banner */}
      <div className="bg-gradient-to-r from-navy-900 via-navy-850 to-navy-900 border border-navy-800 p-6 rounded-2xl space-y-2 shadow-xl">
        <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-wider font-semibold">
          <GraduationCap className="w-4 h-4" />
          <span>Academic Minor Project BCS586 • Department of Computer Science & Engineering</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
          NetShield Research Foundation & Methodology
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
          AI-Powered Network Intrusion Detection System evaluated on the official UNSW-NB15 benchmark with strict anti-leakage feature separation, reproducible pipelines, and five comparative machine learning classifiers.
        </p>
      </div>

      {/* Project Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-navy-900/90 border border-navy-800 p-5 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-cyan-400">
            <Award className="w-5 h-5" />
            <h3 className="text-xs font-bold text-slate-200 font-mono uppercase">Course & Degree</h3>
          </div>
          <p className="text-sm font-semibold text-slate-100">B.Tech Minor Project</p>
          <p className="text-xs text-slate-400 font-mono">Course Code: BCS586 • Semester VI</p>
        </div>

        <div className="bg-navy-900/90 border border-navy-800 p-5 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-emerald-400">
            <Shield className="w-5 h-5" />
            <h3 className="text-xs font-bold text-slate-200 font-mono uppercase">Primary Dataset</h3>
          </div>
          <p className="text-sm font-semibold text-slate-100">UNSW-NB15 Official Split</p>
          <p className="text-xs text-slate-400 font-mono">175,341 Train • 82,332 Test Flows</p>
        </div>

        <div className="bg-navy-900/90 border border-navy-800 p-5 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-purple-400">
            <Cpu className="w-5 h-5" />
            <h3 className="text-xs font-bold text-slate-200 font-mono uppercase">Top Model (Audited)</h3>
          </div>
          <p className="text-sm font-semibold text-slate-100">XGBoost Classifier</p>
          <p className="text-xs text-slate-400 font-mono">87.0% Accuracy • 89.3% F1 • 95.8% AUC</p>
        </div>
      </div>

      {/* Primary Academic Citation Card */}
      <div className="bg-navy-900/90 border border-navy-800 p-6 rounded-xl space-y-4">
        <div className="flex items-center justify-between border-b border-navy-800 pb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-slate-100">Primary Literature Reference</h3>
          </div>
          <button
            type="button"
            onClick={handleCopyBibtex}
            className="px-3 py-1.5 bg-navy-800 hover:bg-navy-750 text-cyan-300 border border-navy-700 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors"
          >
            {copiedBib ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedBib ? 'Copied' : 'Copy BibTeX'}</span>
          </button>
        </div>

        <div className="space-y-2 text-xs">
          <h4 className="font-bold text-slate-200 text-sm">
            UNSW-NB15: a comprehensive data set for network intrusion detection systems
          </h4>
          <p className="text-slate-400">
            <strong>Authors:</strong> Nour Moustafa, Jill Slay (Cyber Range and Cyber Security Labs, UNSW Canberra)
          </p>
          <p className="text-slate-400">
            <strong>Publication:</strong> IEEE Military Communications and Information Systems Conference (MilCIS 2015), Canberra, ACT, Australia.
          </p>
          <p className="text-slate-400 font-mono text-[11px]">
            <strong>DOI:</strong> 10.1109/MilCIS.2015.7348942
          </p>
        </div>

        <div className="bg-navy-950 border border-navy-800 rounded-xl p-4 font-mono text-[11px] text-slate-300 overflow-x-auto">
          <pre>{bibtex}</pre>
        </div>
      </div>

      {/* Research Methodology Principles */}
      <div className="bg-navy-900/90 border border-navy-800 p-6 rounded-xl space-y-4">
        <div className="flex items-center gap-2 border-b border-navy-800 pb-3 text-cyan-400">
          <FileText className="w-5 h-5" />
          <h3 className="text-sm font-bold text-slate-100">Core Engineering Principles</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1.5">
            <h5 className="font-bold text-slate-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>Strict Anti-Leakage Protocol</span>
            </h5>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Features <code className="text-cyan-300">id</code>, <code className="text-cyan-300">attack_cat</code>, and <code className="text-cyan-300">label</code> are explicitly dropped before transformation. Preprocessing encoders and scalers are fitted exclusively on the official training split.
            </p>
          </div>

          <div className="space-y-1.5">
            <h5 className="font-bold text-slate-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Unseen Categorical Handling</span>
            </h5>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              OneHotEncoder is configured with <code className="text-emerald-300">handle_unknown='ignore'</code>, ensuring new protocols or services in live telemetry do not cause runtime crashes.
            </p>
          </div>

          <div className="space-y-1.5">
            <h5 className="font-bold text-slate-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              <span>Realistic Latency Benchmarking</span>
            </h5>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Inference timing separates cold-start loading from inference latency, warm-up runs are evaluated, and throughput is reported per 1,000 flow vectors without packet-per-second fabrication.
            </p>
          </div>

          <div className="space-y-1.5">
            <h5 className="font-bold text-slate-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Defensive Academic Scope</span>
            </h5>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              The platform is architected exclusively for defensive cyber operations, offline forensic evaluation, and research classification.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
