import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchEvent,
  selectEventBySlug,
  selectEventLoading,
} from "@/redux/slices/eventSlice";
import DetailsPage from "./DetailsPage";
import { Helmet } from "react-helmet-async";

export default function DetailsPageWrapper() {
  const { slug } = useParams();
  const dispatch = useDispatch();

  // read from cache if present
  const item = useSelector((state) => selectEventBySlug(state, slug));
  const loading = useSelector(selectEventLoading);

  useEffect(() => {
    if (slug && !item) {
      dispatch(fetchEvent(slug));
    }
  }, [dispatch, slug, item]);

  return (
    <div>
      <Helmet>
        <title>
          {item
            ? `${item.brand_name} - Biya Kormu`
            : "Event Details - Biya Kormu"}
        </title>
        <meta
          name="description"
          content={item?.description || "Event service details"}
        />
      </Helmet>
      <DetailsPage item={item} isLoading={loading && !item} />
    </div>
  );
}
