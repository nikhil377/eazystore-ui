import { useEffect, useState } from "react";
import apiClient from "../api/apiClient";
import { useLoaderData } from "react-router-dom";
import PageTitle from "./PageTitle";

function getRatingValue(value) {
  if (value === null || value === undefined || value === "") return null;

  const rating = Number(value);
  return Number.isInteger(rating) && rating >= 1 && rating <= 5
    ? rating
    : null;
}

// eslint-disable-next-line react/prop-types
function StickerRating({ rating: savedRating, productName }) {
  const [ratingOverride, setRatingOverride] = useState(undefined);
  const savedRatingValue = getRatingValue(savedRating);
  const rating =
    ratingOverride === undefined ? savedRatingValue : ratingOverride;

  useEffect(() => {
    // When the orders GET response changes, prefer the latest server rating.
    setRatingOverride(undefined);
  }, [savedRating]);

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-2">
      <span className="text-sm text-gray-600 dark:text-gray-400">Rating:</span>
      <div
        role="group"
        aria-label={`Rate ${productName}`}
        className="flex items-center"
      >
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setRatingOverride(value)}
            aria-label={`${value} star${value === 1 ? "" : "s"}`}
            aria-pressed={rating === value}
            className={`text-xl leading-none transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-500 ${
              rating !== null && value <= rating
                ? "text-amber-400"
                : "text-gray-400 dark:text-gray-500 hover:text-amber-300"
            }`}
          >
            ★
          </button>
        ))}
      </div>
      {rating !== null ? (
        <>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {rating}/5
          </span>
          <button
            type="button"
            onClick={() => setRatingOverride(null)}
            className="text-sm text-primary dark:text-light underline underline-offset-2 hover:text-dark dark:hover:text-lighter"
            aria-label={`Reset rating for ${productName}`}
          >
            Reset
          </button>
        </>
      ) : (
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Not rated
        </span>
      )}
    </div>
  );
}

export default function Orders() {
  const orders = useLoaderData();

  function formatDate(isoDate) {
    if (!isoDate) return "N/A";
    return new Date(isoDate).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
  return (
    <div className="min-h-[852px] container mx-auto px-6 py-12 font-primary dark:bg-darkbg">
      {orders.length === 0 ? (
        <p className="text-center text-2xl  text-primary dark:text-lighter">
          No orders found.
        </p>
      ) : (
        <div className="space-y-6 mt-4">
          <PageTitle title="My Orders" />
          {orders.map((order) => (
            <div
              key={order.orderId}
              className="bg-white dark:bg-gray-700 shadow-md rounded-md p-6"
            >
              <h2 className="text-xl font-semibold mb-2 text-primary dark:text-lighter">
                Order #{order.orderId}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Status:{" "}
                <span className="font-medium text-gray-800 dark:text-lighter">
                  {order.status}
                </span>
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Price:{" "}
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  ${order.totalPrice}
                </span>
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Date:{" "}
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  {formatDate(order.createdAt)}
                </span>
              </p>

              <div className="mt-4 space-y-4">
                {order.items.map((item, index) => (
                  <div
                    key={item.orderItemId ?? item.id ?? `${order.orderId}-${item.productId ?? index}`}
                    className="flex items-center border-b pb-4"
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.productName}
                      className="w-16 h-16 object-cover rounded-md mr-4"
                    />
                    <div>
                      <h3 className="text-md font-medium text-gray-800 dark:text-gray-200">
                        {item.productName}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Quantity: {item.quantity}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Price: ${item.price}
                      </p>
                      <StickerRating
                        rating={item.rating}
                        productName={item.productName}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export async function ordersLoader() {
  try {
    const response = await apiClient.get("/orders"); // Axios GET Request
    return response.data;
  } catch (error) {
    throw new Response(
      error.response?.data?.errorMessage ||
        error.message ||
        "Failed to fetch orders. Please try again.",
      { status: error.status || 500 }
    );
  }
}
