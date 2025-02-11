import * as React from "react";
import classNames from "clsx";
import { T } from "lib/i18n/react";
import { ThanosAsset, ThanosAssetType } from "lib/thanos/front";
import useCopyToClipboard from "lib/ui/useCopyToClipboard";
import FormField from "app/atoms/FormField";
import { ReactComponent as CopyIcon } from "app/icons/copy.svg";

type AssetInfoProps = {
  asset: ThanosAsset;
};

const AssetInfo: React.FC<AssetInfoProps> = ({ asset }) => {
  if (asset.type === ThanosAssetType.XTZ) return null;

  return (
    <div className={classNames("w-full max-w-sm mx-auto")}>
      <InfoField
        textarea
        rows={2}
        id="contract-address"
        label={<T id="contract" />}
        labelDescription={
          <T id="addressOfTokenContract" substitutions={[asset.symbol]} />
        }
        value={asset.address}
        size={36}
        style={{
          resize: "none",
        }}
      />

      {asset.type === ThanosAssetType.FA2 && (
        <InfoField id="token-id" label={<T id="tokenId" />} value={asset.id} />
      )}
    </div>
  );
};

export default AssetInfo;

type InfoFieldProps = React.ComponentProps<typeof FormField>;

const InfoField: React.FC<InfoFieldProps> = (props) => {
  const { fieldRef, copy, copied } = useCopyToClipboard();

  return (
    <>
      <FormField ref={fieldRef} spellCheck={false} readOnly {...props} />

      <button
        type="button"
        className={classNames(
          "mx-auto mb-6",
          "py-1 px-2 w-40",
          "bg-primary-orange rounded",
          "border border-primary-orange",
          "flex items-center justify-center",
          "text-primary-orange-lighter text-shadow-black-orange",
          "text-sm font-semibold",
          "transition duration-300 ease-in-out",
          "opacity-90 hover:opacity-100 focus:opacity-100",
          "shadow-sm",
          "hover:shadow focus:shadow"
        )}
        onClick={copy}
      >
        {copied ? (
          <T id="copiedAddress" />
        ) : (
          <>
            <CopyIcon
              className={classNames(
                "mr-1",
                "h-4 w-auto",
                "stroke-current stroke-2"
              )}
            />
            <T id="copyAddressToClipboard" />
          </>
        )}
      </button>
    </>
  );
};
