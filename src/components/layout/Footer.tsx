export function Footer() {
  return (
    <footer className="py-6 bg-gray-100 dark:bg-gray-800 border-t">
      <div className="container mx-auto px-4 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} ArbiSmart. All rights reserved.</p>
        <p className="text-xs mt-1">
          Disclaimer: Currency trading involves substantial risk of loss and is not suitable for all investors.
        </p>
      </div>
    </footer>
  );
}
