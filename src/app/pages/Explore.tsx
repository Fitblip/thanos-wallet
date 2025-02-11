import * as React from "react";
import classNames from "clsx";
import { Link, Redirect, useLocation } from "lib/woozie";
import {
  getAssetKey,
  ThanosAccountType,
  ThanosAsset,
  ThanosAssetType,
  useAccount,
  useAssetBySlug,
  XTZ_ASSET,
} from "lib/thanos/front";
import { T, t } from "lib/i18n/react";
import useTippy from "lib/ui/useTippy";
import { useAppEnv } from "app/env";
import ErrorBoundary from "app/ErrorBoundary";
import PageLayout from "app/layouts/PageLayout";
import OperationHistory from "app/templates/OperationHistory";
import AssetInfo from "app/templates/AssetInfo";
import Spinner from "app/atoms/Spinner";
import { ReactComponent as ExploreIcon } from "app/icons/explore.svg";
import { ReactComponent as ChevronRightIcon } from "app/icons/chevron-right.svg";
import { ReactComponent as QRIcon } from "app/icons/qr.svg";
import { ReactComponent as SendIcon } from "app/icons/send.svg";
import EditableTitle from "./Explore/EditableTitle";
import AddressChip from "./Explore/AddressChip";
import MainAssetBanner from "./Explore/MainAssetBanner";
import BakingSection from "./Explore/BakingSection";
import Assets from "./Explore/Assets";
import AddUnknownTokens from "./Explore/AddUnknownTokens";

type ExploreProps = {
  assetSlug?: string | null;
};

const Explore: React.FC<ExploreProps> = ({ assetSlug }) => {
  const { fullPage } = useAppEnv();
  const account = useAccount();
  const asset = useAssetBySlug(assetSlug);

  if (assetSlug && !asset) {
    return <Redirect to="/" />;
  }

  const accountPkh = account.publicKeyHash;
  const canSend = account.type !== ThanosAccountType.WatchOnly;

  return (
    <PageLayout
      pageTitle={
        <>
          <ExploreIcon className="w-auto h-4 mr-1 stroke-current" />
          <T id="explore" />
          {asset && (
            <>
              <ChevronRightIcon className="w-auto h-4 mx-px stroke-current opacity-75" />
              <span className="font-normal">{asset.symbol}</span>
            </>
          )}
        </>
      }
    >
      {fullPage && (
        <>
          <EditableTitle />
          <hr className="mb-6" />
        </>
      )}

      <div
        className={classNames(
          "flex flex-col items-center",
          fullPage ? "mb-10" : "mb-6"
        )}
      >
        <AddressChip pkh={accountPkh} className="mb-6" />

        <MainAssetBanner accountPkh={accountPkh} asset={asset ?? XTZ_ASSET} />

        <div
          className="flex items-stretch w-full mx-auto mt-4"
          style={{ maxWidth: "18rem" }}
        >
          <div className="w-1/2 p-2">
            <Link
              to="/receive"
              className={classNames(
                "block w-full",
                "py-2 px-4 rounded",
                "border-2",
                "border-blue-500 hover:border-blue-600 focus:border-blue-600",
                "flex items-center justify-center",
                "text-blue-500 hover:text-blue-600 focus:text-blue-600",
                "shadow-sm hover:shadow focus:shadow",
                "text-base font-semibold",
                "transition ease-in-out duration-300"
              )}
              type="button"
            >
              <QRIcon
                className={classNames(
                  "-ml-2 mr-2",
                  "h-5 w-auto",
                  "stroke-current"
                )}
              />
              <T id="receive" />
            </Link>
          </div>

          <div className="w-1/2 p-2">
            <SendButton canSend={canSend} asset={asset} />
          </div>
        </div>
      </div>

      <SecondarySection asset={asset} />

      <AddUnknownTokens />
    </PageLayout>
  );
};

export default Explore;

type SendButtonProps = {
  canSend: boolean;
  asset: ThanosAsset | null;
};

const SendButton = React.memo<SendButtonProps>(({ canSend, asset }) => {
  const tippyProps = {
    trigger: "mouseenter",
    hideOnClick: false,
    content: t("disabledForWatchOnlyAccount"),
    animation: "shift-away-subtle",
  };

  const sendButtonRef = useTippy<HTMLButtonElement>(tippyProps);
  const commonSendButtonProps = {
    className: classNames(
      "w-full",
      "py-2 px-4 rounded",
      "border-2",
      "border-blue-500",
      canSend && "hover:border-blue-600 focus:border-blue-600",
      "bg-blue-500",
      canSend && "hover:bg-blue-600 focus:bg-blue-600",
      canSend && "shadow-sm hover:shadow focus:shadow",
      !canSend && "opacity-50",
      "flex items-center justify-center",
      "text-white",
      "text-base font-semibold",
      "transition ease-in-out duration-300"
    ),
    children: (
      <>
        <SendIcon
          className={classNames(
            "-ml-3 -mt-1 mr-1",
            "h-5 w-auto",
            "transform -rotate-45",
            "stroke-current"
          )}
        />
        <T id="send" />
      </>
    ),
  };

  return canSend ? (
    <Link
      to={asset ? `/send/${getAssetKey(asset)}` : "/send"}
      type="button"
      {...commonSendButtonProps}
    />
  ) : (
    <button ref={sendButtonRef} {...commonSendButtonProps} />
  );
});

const Delegation: React.FC = () => (
  <SuspenseContainer whileMessage={t("delegationInfoWhileMessage")}>
    <BakingSection />
  </SuspenseContainer>
);

type ActivityProps = {
  asset?: ThanosAsset;
};

const Activity: React.FC<ActivityProps> = ({ asset }) => {
  const account = useAccount();

  return (
    <SuspenseContainer whileMessage={t("operationHistoryWhileMessage")}>
      <OperationHistory
        accountPkh={account.publicKeyHash}
        accountOwner={
          account.type === ThanosAccountType.ManagedKT
            ? account.owner
            : undefined
        }
        asset={asset}
      />
    </SuspenseContainer>
  );
};

function useTabSlug() {
  const { search } = useLocation();
  const tabSlug = React.useMemo(() => {
    const usp = new URLSearchParams(search);
    return usp.get("tab");
  }, [search]);
  return React.useMemo(() => tabSlug, [tabSlug]);
}

type SecondarySectionProps = {
  asset: ThanosAsset | null;
  className?: string;
};

const SecondarySection: React.FC<SecondarySectionProps> = ({
  asset,
  className,
}) => {
  const { fullPage } = useAppEnv();
  const tabSlug = useTabSlug();

  const tabs = React.useMemo<
    {
      slug: string;
      title: string;
      Component: React.FC;
    }[]
  >(() => {
    if (!asset) {
      return [
        {
          slug: "assets",
          title: t("assets"),
          Component: Assets,
        },
        {
          slug: "delegation",
          title: t("delegation"),
          Component: Delegation,
        },
        {
          slug: "activity",
          title: t("activity"),
          Component: Activity,
        },
      ];
    }

    const activity = {
      slug: "activity",
      title: t("activity"),
      Component: () => <Activity asset={asset} />,
    };

    if (asset.type === ThanosAssetType.XTZ) {
      return [activity];
    }

    return [
      activity,
      {
        slug: "about",
        title: t("about"),
        Component: () => <AssetInfo asset={asset} />,
      },
    ];
  }, [asset]);

  const { slug, Component } = React.useMemo(() => {
    const tab = tabSlug ? tabs.find((t) => t.slug === tabSlug) : null;
    return tab ?? tabs[0];
  }, [tabSlug, tabs]);

  return (
    <div
      className={classNames(
        "-mx-4",
        "shadow-top-light",
        fullPage && "rounded-t-md",
        className
      )}
    >
      <div
        className={classNames(
          "w-full max-w-sm mx-auto",
          "flex flex-wrap items-center justify-center"
        )}
      >
        {tabs.map((t) => {
          const active = slug === t.slug;

          return (
            <Link
              key={asset ? `asset_${t.slug}` : t.slug}
              to={(lctn) => ({ ...lctn, search: `?tab=${t.slug}` })}
              replace
              className={classNames(
                "w-1/3",
                "text-center cursor-pointer mb-1 pb-1 pt-2 px-3",
                "text-gray-500 text-sm font-medium",
                "border-t-2",
                active ? "border-primary-orange" : "border-transparent",
                active ? "text-primary-orange" : "hover:text-primary-orange",
                "transition ease-in-out duration-300"
              )}
            >
              {t.title}
            </Link>
          );
        })}
      </div>

      <div className={classNames("mx-4 mb-4", fullPage ? "mt-8" : "mt-4")}>
        {Component && <Component />}
      </div>
    </div>
  );
};

type SuspenseContainerProps = {
  whileMessage: string;
  fallback?: React.ReactNode;
};

const SuspenseContainer: React.FC<SuspenseContainerProps> = ({
  whileMessage,
  fallback = <SpinnerSection />,
  children,
}) => (
  <ErrorBoundary whileMessage={whileMessage}>
    <React.Suspense fallback={fallback}>{children}</React.Suspense>
  </ErrorBoundary>
);

const SpinnerSection: React.FC = () => (
  <div className="flex justify-center my-12">
    <Spinner theme="gray" className="w-20" />
  </div>
);
