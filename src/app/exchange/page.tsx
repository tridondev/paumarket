import SectionBrowser from '@/components/SectionBrowser';
import { PROMO_IMAGES } from '@/lib/stock-images';

export default function ExchangePage() {
  return (
    <SectionBrowser
      section="exchange"
      eyebrow="PAU Exchange"
      title="Buy and sell used items between students"
      description="New, used, like-new, free, or wanted — resell what you no longer need or find what someone else is giving up."
      emptyLabel="No exchange listings yet."
      bannerImage={PROMO_IMAGES.exchange}
    />
  );
}
