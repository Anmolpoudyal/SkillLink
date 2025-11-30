import { Star } from "lucide-react";    
import Starter from "../components/Starter.jsx";
import ServiceCategories from "../components/ServiceCategories.jsx";
import HowItWorks from "../components/howItWorks.jsx";
import CustomerInfo from "../components/CustomerInfo.jsx";
import ProviderInfo from "../components/ProviderInfo.jsx";
import Footer from "../components/ui/footer.jsx";
import HomeNav from "../components/homeNav.jsx";
function HomePage() {
  return (
    <>
    <HomeNav />
    <Starter />
    <ServiceCategories />
    <HowItWorks />
    <CustomerInfo />
    <ProviderInfo />
    <Footer />
    
    </>
  );
}
export default HomePage;