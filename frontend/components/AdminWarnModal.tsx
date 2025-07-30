import clsx from "clsx";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import Checkbox from "~/components/Checkbox";
import InputTitle from "~/components/InputTitle";
import ModalPortal from "~/components/ModalPortal";
import Select from "~/components/Select";
import TextInput from "~/components/TextInput";
import { useMyFetch } from "~/lib/contexts.ts";

export default function AdminWarnModal(
  props: React.PropsWithoutRef<{
    showAdminWarnModal: boolean;
    setShowAdminWarnModal: (show: boolean) => void;
    target: {
      type: "chart" | "user";
      value: string;
    };
    onSend: () => void;
  }>,
) {
  const { showAdminWarnModal, setShowAdminWarnModal, target, onSend } = props;
  const myFetch = useMyFetch();
  const { t } = useTranslation("warnModal");
  const { t: rootT } = useTranslation("root");
  const [warnLevel, setWarnLevel] = useState<"low" | "medium" | "high" | "ban">(
    "medium",
  );
  const [deleteChart, setDeleteChart] = useState(false);

  const sendAdminDeletionRequest = useCallback(async () => {
    const resp = await myFetch("/api/admin/warn", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        level: warnLevel,
        deleteChart,
        targetType: target.type,
        target: target.value,

        reason: (
          document.querySelector("[data-name=warnReason]") as HTMLInputElement
        ).value,
      }),
    });
    if (!resp.ok) {
      const error = await resp.json();
      throw new Error(error.message);
    }
    onSend();
  }, [target, myFetch, warnLevel, deleteChart, onSend]);

  return (
    <ModalPortal isOpen={showAdminWarnModal}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendAdminDeletionRequest();
        }}
      >
        <h1 className="text-xl font-bold text-normal mb-2 break-word">
          {t("title")}
        </h1>
        <Checkbox
          name="warnDelete"
          label={t("delete")}
          className="mb-2"
          checked={deleteChart}
          onChange={(e) => setDeleteChart(e)}
        />
        <InputTitle text={t("level.title")}>
          <Select
            className="w-full"
            value={warnLevel}
            items={["low", "medium", "high", "ban"].map((level) => ({
              type: "item",
              label: t(`level.${level}`),
              description: t(`levelDescription.${level}`),
              value: level,
            }))}
            onChange={(e) =>
              setWarnLevel(e as "low" | "medium" | "high" | "ban")
            }
          />
        </InputTitle>
        <InputTitle text={t("reason")}>
          <TextInput
            name="warnReason"
            textarea
            optional
            className="w-full h-32"
          />
        </InputTitle>
        <div className="flex justify-end mt-4 gap-2">
          <button
            className="px-4 py-2 button-cancel"
            onClick={() => {
              setShowAdminWarnModal(false);
            }}
          >
            {rootT("cancel")}
          </button>
          <button type="submit" className={clsx("px-4 py-2 button-danger")}>
            {t("ok")}
          </button>
        </div>
      </form>
    </ModalPortal>
  );
}
