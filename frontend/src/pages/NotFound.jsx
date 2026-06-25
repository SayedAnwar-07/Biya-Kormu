import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <Helmet>
        <title>Page Not Found - Biya Kormu</title>
        <meta
          name="description"
          content="The page you're looking for doesn't exist on Biya Kormu."
        />
      </Helmet>
      <Card className="w-[400px] text-center shadow-xl">
        <CardContent className="flex flex-col items-center justify-center space-y-6 py-10">
          <h1 className="text-6xl font-bold text-gray-800">404</h1>
          <p className="text-lg text-gray-600">
            Oops! The page you’re looking for doesn’t exist.
          </p>
          <div className="flex gap-4">
            <Button onClick={() => navigate("/")}>🏠 Home</Button>
            <Button variant="outline" onClick={() => navigate(-1)}>
              ← Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
