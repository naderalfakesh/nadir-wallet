import React from "react";
import { StyleSheet } from "react-native";
import Animated, { FadeInRight } from "react-native-reanimated";
import { Button, Screen, ScreenHeader, TestnetBadge } from "@/components";
import { useTranslation } from "@/i18n/useTranslation";
import { biometryIcon } from "@/services/auth/biometry";
import { AmountStep } from "./components/AmountStep";
import { FooterButton } from "./components/FooterButton";
import { ReviewStep } from "./components/ReviewStep";
import { SendProgressBar } from "./components/SendProgressBar";
import { ToStep } from "./components/ToStep";
import { getReviewCtaState } from "./send.utils";
import { SendConfirmOverlay } from "./SendConfirmOverlay";
import { useSendFlow } from "./useSendFlow";

interface SendScreenProps {
  tokenId?: string;
}

export function SendScreen({ tokenId }: SendScreenProps) {
  const { t } = useTranslation();
  const flow = useSendFlow(tokenId);
  const { step, stepIndex, token, risk, blocked, simStatus } = flow;

  if (flow.phase) {
    return (
      <SendConfirmOverlay
        phase={flow.phase}
        setPhase={flow.setPhase}
        outcome={flow.sendOutcome}
        token={token}
        amount={flow.amtNum}
        fiat={flow.fiat}
        to={flow.recipient}
        onRetry={flow.backToReview}
        onCancel={flow.backToReview}
      />
    );
  }

  const reviewCta = getReviewCtaState({
    blocked,
    riskLoading: flow.riskLoading,
    scanMismatch: flow.scanMismatch,
    simulationLoading: flow.simulationLoading,
    simStatus,
  });

  return (
    <Screen avoidKeyboard>
      <ScreenHeader
        title={t(`send.steps.${step}`)}
        subtitle={t("send.steps.step", { n: stepIndex + 1 })}
        onBack={flow.back}
        trailing={<TestnetBadge label={flow.chain.short} />}
      />
      <SendProgressBar stepIndex={stepIndex} />

      <Animated.View key={step} entering={FadeInRight.duration(180)} style={styles.stepContainer}>
        {step === "to" && (
          <>
            <ToStep
              to={flow.to}
              toError={flow.toError}
              toValid={flow.toValid}
              risk={risk}
              riskUnavailable={flow.showRiskUnavailable}
              onChangeTo={flow.editTo}
              onScan={flow.openScanner}
            />
            <FooterButton>
              <Button
                label={blocked ? t("send.to.blocked") : t("send.to.continue")}
                disabled={!flow.toValid || blocked || flow.riskLoading}
                onPress={flow.continueFromTo}
              />
            </FooterButton>
          </>
        )}

        {step === "amount" && (
          <AmountStep
            token={token}
            amt={flow.amt}
            amtNum={flow.amtNum}
            fiat={flow.fiat}
            onKey={flow.onKey}
            onMax={flow.setMax}
            onPickToken={flow.pickToken}
            onReview={flow.goToReview}
          />
        )}

        {step === "review" && (
          <>
            <ReviewStep
              token={token}
              amtNum={flow.amtNum}
              fiat={flow.fiat}
              trimmedTo={flow.recipient}
              chain={flow.chain}
              fee={flow.fee}
              total={flow.total}
              simulationLoading={flow.simulationLoading}
              warnings={flow.warnings}
              risk={risk}
              riskUnavailable={flow.showRiskUnavailable}
              netMismatch={flow.netMismatch}
              recipientNet={flow.recipientNet}
              simStatus={simStatus}
              balanceAfter={flow.balanceAfter}
            />
            <FooterButton>
              <Button
                label={t(reviewCta.labelKey)}
                icon={biometryIcon()}
                disabled={reviewCta.disabled}
                onPress={flow.startConfirm}
              />
            </FooterButton>
          </>
        )}
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stepContainer: {
    flex: 1,
  },
});
