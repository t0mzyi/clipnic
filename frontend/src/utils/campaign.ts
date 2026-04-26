export const FALLBACK_BANNERS = [
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=800&auto=format&fit=crop',
];

/**
 * Returns a consistent banner for a campaign.
 * Uses the campaign's banner_url if provided, otherwise picks a deterministic 
 * fallback based on the campaign ID.
 */
export const getCampaignBanner = (campaignId: string, bannerUrl?: string | null) => {
    if (bannerUrl && bannerUrl.trim().length > 0) return bannerUrl;
    
    // Deterministic fallback based on ID hash
    if (!campaignId) return FALLBACK_BANNERS[0];
    
    let hash = 0;
    for (let i = 0; i < campaignId.length; i++) {
        hash = campaignId.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const index = Math.abs(hash) % FALLBACK_BANNERS.length;
    return FALLBACK_BANNERS[index];
};
