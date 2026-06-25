import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Eye, MessageCircle, Star } from "lucide-react";
import { Link } from "react-router-dom";

const UserEvents = ({ user }) => {
  return (
    <Card>
      <CardContent>
        {user.seller_created_events?.length > 0 ? (
          <div className="grid gap-4">
            {user.seller_created_events.map((event) => (
              <div
                key={event.id}
                className="flex items-center flex-col md:flex-row space-x-4 "
              >
                <img
                  src={event.logo}
                  alt={event.brand_name}
                  className="h-16 w-16 rounded-lg object-cover"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/64";
                  }}
                />
                <div className="flex-1 mb-3">
                  <h4 className="font-semibold">{event.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {event.brand_name}
                  </p>
                  <div className="flex flex-col md:flex-row  space-x-4 mt-2 text-sm">
                    <span className="flex items-center">
                      <Eye className="h-4 w-4 mr-1" />
                      {event.total_views} views
                    </span>
                    <span className="flex items-center">
                      <MessageCircle className="h-4 w-4 mr-1" />
                      {event.total_reviews} reviews
                    </span>
                    <span className="flex items-center">
                      <Star className="h-4 w-4 mr-1" />
                      {event.average_rating}/5
                    </span>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full md:w-32">
                  <Link to={`/events/${event.slug}`}>View Event</Link>
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No events created yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserEvents;
