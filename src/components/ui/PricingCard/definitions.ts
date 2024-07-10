export type PricingCardProps = {
  planName: string;
  planPrice: number;
  // A <p> element, we pass it this way because we want to apply custom styling to it
  planDescription: React.ReactNode;

  // A Button element, should redirect the user to the checkout. We do not handle this inside the PricingCard component
  // incase you want to do things like use a pricing card for something that does not have a checkout page.
  // You can use the <PricingCardCheckoutButton/> component if the thing you are displaying in a pricing card should have a checkout page
  planCTAButton: React.ReactNode;

  // An array of <p> elements, we pass them this way because we want to apply custom styling to certain parts of each element
  planFeatures: React.ReactNode[];
};
