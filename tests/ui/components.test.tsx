/**
 * Tests for UI components
 */
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  Button,
  Typography,
  Card,
  Stack,
  Container,
  Loader,
} from "@snackro/ui";

describe("UI Components", () => {
  describe("Button", () => {
    it("renders with children", () => {
      render(<Button>Click me</Button>);
      expect(screen.getByText("Click me")).toBeInTheDocument();
    });

    it("is disabled when loading", () => {
      render(<Button loading>Submit</Button>);
      expect(screen.getByRole("button")).toBeDisabled();
    });

    it("is disabled when disabled prop is set", () => {
      render(<Button disabled>Submit</Button>);
      expect(screen.getByRole("button")).toBeDisabled();
    });
  });

  describe("Typography", () => {
    it("renders text content", () => {
      render(<Typography variant="h1">Hello World</Typography>);
      expect(screen.getByText("Hello World")).toBeInTheDocument();
    });

    it("renders as correct HTML element", () => {
      render(<Typography variant="h2">Heading</Typography>);
      const heading = screen.getByText("Heading");
      expect(heading.tagName).toBe("H2");
    });
  });

  describe("Card", () => {
    it("renders children", () => {
      render(<Card>Card content</Card>);
      expect(screen.getByText("Card content")).toBeInTheDocument();
    });
  });

  describe("Stack", () => {
    it("renders children", () => {
      render(
        <Stack>
          <div>Item 1</div>
          <div>Item 2</div>
        </Stack>,
      );
      expect(screen.getByText("Item 1")).toBeInTheDocument();
      expect(screen.getByText("Item 2")).toBeInTheDocument();
    });
  });

  describe("Container", () => {
    it("renders children", () => {
      render(<Container>Content</Container>);
      expect(screen.getByText("Content")).toBeInTheDocument();
    });
  });

  describe("Loader", () => {
    it("renders with accessible label", () => {
      render(<Loader />);
      expect(screen.getByRole("status")).toBeInTheDocument();
    });
  });
});
