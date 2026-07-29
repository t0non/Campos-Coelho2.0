"use client";

import React from "react";
import Link from "next/link";
import { trackEvent, EventName } from "@/lib/analytics";

interface TrackedLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  eventName: EventName;
  eventParams?: Record<string, string | number | boolean | undefined>;
  external?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function TrackedLink({
  href,
  eventName,
  eventParams = {},
  external = false,
  children,
  className,
  onClick,
  ...props
}: TrackedLinkProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    trackEvent(eventName, eventParams);
    if (onClick) {
      onClick(e);
    }
  };

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className={className}
        {...props}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} onClick={handleClick} className={className} {...props}>
      {children}
    </Link>
  );
}

export function TrackedPhoneLink({
  href,
  location,
  serviceSlug,
  children,
  className,
  ...props
}: {
  href: string;
  location: string;
  serviceSlug?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <TrackedLink
      href={href}
      eventName="click_phone"
      eventParams={{ location, service_slug: serviceSlug }}
      external
      className={className}
      {...props}
    >
      {children}
    </TrackedLink>
  );
}

export function TrackedScheduleLink({
  href,
  location,
  serviceSlug,
  children,
  className,
  ...props
}: {
  href: string;
  location: string;
  serviceSlug?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <TrackedLink
      href={href}
      eventName="click_schedule"
      eventParams={{ location, service_slug: serviceSlug }}
      className={className}
      {...props}
    >
      {children}
    </TrackedLink>
  );
}
