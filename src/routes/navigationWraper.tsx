import { MobileNavigation } from "./mobileNavigation";
import { Navigation } from "./navigation";

interface Props {
  toggleTheme?: () => void;
  currentTheme?: string;
}

const NavigationWrapper = ({ toggleTheme, currentTheme }: Props) => (
  <>
    <Navigation
    // className="hidden lg:block"
    // toggleTheme={toggleTheme}
    // currentTheme={currentTheme}
    />
    {/* <MobileNavigation
      className="md:hidden"
      toggleTheme={toggleTheme}
      currentTheme={currentTheme}
    /> */}
  </>
);

export default NavigationWrapper;
