import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders HealthCare Web3 EHR heading", () => {
  render(<App />);
  const headingElement = screen.getByText(/HealthCare Web3 EHR/i);
  expect(headingElement).toBeInTheDocument();
});
