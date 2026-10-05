import { Building2, CreditCard, Link2, Save, Settings2, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { Card } from '../components/ui/Card';

type TabKey = 'agency' | 'integrations' | 'billing' | 'preferences';

const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'agency', label: 'Agency Profile', icon: <Building2 size={16} /> },
  { key: 'integrations', label: 'Marketplace Integrations', icon: <Link2 size={16} /> },
  { key: 'billing', label: 'Billing & Fees', icon: <CreditCard size={16} /> },
  { key: 'preferences', label: 'System Preferences', icon: <Settings2 size={16} /> },
];

const inputClass = 'w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring';

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('agency');
  const [agencyName, setAgencyName] = useState(localStorage.getItem('agencyName') || 'Shariq Enterprises');
  const [saved, setSaved] = useState(false);

    const handleSave = () => {
    localStorage.setItem('agencyName', agencyName);
    window.dispatchEvent(new Event('agencyNameChanged')); // <--- ADD THIS MAGIC LINE
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your agency configuration and system preferences.</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Tabs */}
        <div className="w-64 flex-shrink-0 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="flex-1">
          <Card className="p-6">
            {activeTab === 'agency' && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Agency Profile</h2>
                <p className="text-sm text-muted-foreground">Update your company information and contact details.</p>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium">Agency Name</label>
                    <input 
                      className={inputClass} 
                      value={agencyName} 
                      onChange={(e) => setAgencyName(e.target.value)} 
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Contact Email</label>
                    <input className={inputClass} defaultValue="admin@shariqenterprises.com" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Phone Number</label>
                    <input className={inputClass} defaultValue="+1 (555) 123-4567" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Timezone</label>
                    <select className={inputClass}>
                      <option>Eastern Time (ET)</option>
                      <option>Pacific Time (PT)</option>
                      <option>UTC</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-medium">Business Address</label>
                    <input className={inputClass} defaultValue="123 Commerce Blvd, Suite 400, New York, NY 10001" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'integrations' && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Marketplace Integrations</h2>
                <p className="text-sm text-muted-foreground">Manage API connections to Amazon and Walmart.</p>
                <div className="space-y-4">
                  <div className="rounded-md border p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-600 font-bold">A</div>
                        <div>
                          <p className="font-semibold">Amazon Seller Central</p>
                          <p className="text-xs text-green-600 flex items-center gap-1"><CheckCircle2 size={12} /> Connected</p>
                        </div>
                      </div>
                      <button className="rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-accent">Manage Keys</button>
                    </div>
                  </div>
                  <div className="rounded-md border p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold">W</div>
                        <div>
                          <p className="font-semibold">Walmart Marketplace</p>
                          <p className="text-xs text-green-600 flex items-center gap-1"><CheckCircle2 size={12} /> Connected</p>
                        </div>
                      </div>
                      <button className="rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-accent">Manage Keys</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'billing' && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Billing & Agency Fees</h2>
                <p className="text-sm text-muted-foreground">Set default billing parameters for your clients.</p>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium">Default Management Fee Type</label>
                    <select className={inputClass}>
                      <option>Percentage of Gross Sales</option>
                      <option>Flat Monthly Retainer</option>
                      <option>Hybrid (Base + %)</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Default Fee Percentage (%)</label>
                    <input type="number" className={inputClass} defaultValue="15" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Currency</label>
                    <select className={inputClass}>
                      <option>USD ($)</option>
                      <option>EUR (€)</option>
                      <option>GBP (£)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">System Preferences</h2>
                <p className="text-sm text-muted-foreground">Configure how data is displayed across the dashboard.</p>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium">Date Format</label>
                    <select className={inputClass}>
                      <option>MM/DD/YYYY</option>
                      <option>DD/MM/YYYY</option>
                      <option>YYYY-MM-DD</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Number Format</label>
                    <select className={inputClass}>
                      <option>1,234.56 (US/UK)</option>
                      <option>1.234,56 (EU)</option>
                    </select>
                  </div>
                  <div className="md:col-span-2 flex items-center gap-2 pt-2">
                    <input type="checkbox" id="dark-mode" className="h-4 w-4" />
                    <label htmlFor="dark-mode" className="text-sm font-medium">Enable Dark Mode (Coming Soon)</label>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="mt-8 flex justify-end border-t pt-4">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
              >
                {saved ? <><CheckCircle2 size={16} /> Saved!</> : <><Save size={16} /> Save Changes</>}
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}