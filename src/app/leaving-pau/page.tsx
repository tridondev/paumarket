import SectionBrowser from '@/components/SectionBrowser';
import { PROMO_IMAGES } from '@/lib/stock-images';

export default function LeavingPauPage() {
  return (
    <SectionBrowser
      section="leaving-pau"
      eyebrow="Leaving PAU"
      title="Graduation & move-out sales"
      description="Every cohort leaves behind furniture, electronics, books and appliances that incoming students need. Browse by class, or list your own Leaving PAU sale before you go."
      emptyLabel="No Leaving PAU sales listed yet."
      bannerImage={PROMO_IMAGES.leavingPau}
    />
  );
}
