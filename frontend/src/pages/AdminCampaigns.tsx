import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export const AdminCampaigns = () => {

    const campaigns = [
        { id: '1', title: 'Summer Skincare Launch', brand: 'GlowRecipe', cpm: '$0.40', budget: '$18,134.00', used: '63%', status: 'Active' },
        { id: '2', title: 'Tech Gadget Review', brand: 'MarquesBrownlee', cpm: '$1.20', budget: '$25,000.00', used: '48%', status: 'Active' },
        { id: '3', title: 'Minimalist Desk Setup', brand: 'Grovemade', cpm: '$0.55', budget: '$5,000.00', used: '100%', status: 'Paused' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-12"
        >
            <div className="flex items-end justify-between border-b border-white/10 pb-8">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight mb-2">Manage Campaigns</h1>
                    <p className="text-white/50 text-lg">Create, monitor, and adjust clipping campaigns.</p>
                </div>
                <Button variant="primary">Create Campaign</Button>
            </div>

            <div className="bg-[#0A0A0A] border border-white/5 rounded-[24px] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="border-b border-white/10 text-white/50 text-sm font-medium whitespace-nowrap">
                                <th className="px-6 py-4 font-normal">Campaign Title</th>
                                <th className="px-6 py-4 font-normal">Brand</th>
                                <th className="px-6 py-4 font-normal">CPM</th>
                                <th className="px-6 py-4 font-normal">Budget</th>
                                <th className="px-6 py-4 font-normal">Status</th>
                                <th className="px-6 py-4 font-normal text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {campaigns.map((camp) => (
                                <tr key={camp.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 font-medium whitespace-nowrap">{camp.title}</td>
                                    <td className="px-6 py-4 text-white/70 whitespace-nowrap">{camp.brand}</td>
                                    <td className="px-6 py-4 font-mono tabular-metrics">{camp.cpm}</td>
                                    <td className="px-6 py-4 font-mono tabular-metrics">
                                        <div className="flex flex-col whitespace-nowrap">
                                            <span>{camp.budget}</span>
                                            <span className="text-xs text-white/40">{camp.used} used</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4"><Badge status={camp.status} /></td>
                                    <td className="px-6 py-4 text-right">
                                        <Button variant="ghost" size="sm">Edit</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
};
