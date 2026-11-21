import React from "react";
import { StyleSheet, View } from "react-native";
import Animated, { FadeInRight } from "react-native-reanimated";
import { Button, Screen, ScreenHeader, TestnetBadge } from "@/components";
import { useTranslation } from "@/i18n/useTranslation";
import { biometryIcon } from "@/services/auth/biometry";
import { useTheme, useThemedStyles, type Theme } from "@/theme";
import { AmountStep } from "./components/AmountStep";
import { FooterButton } from "./components/FooterButton";
import { ReviewStep } from "./components/ReviewStep";
import { ToStep } from "./components/ToStep";
import { SEND_STEPS } from "./send.constants";
import { SendConfirmOverlay } from "./SendConfirmOverlay";
import { useSendFlow } from "./useSendFlow";

interface SendScreenProps {
  tokenId?: string;
}

export function SendScreen({ tokenId }: SendScreenProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
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

  return (
    <Screen avoidKeyboard>
      <ScreenHeader
        title={t(`send.steps.${step}`)}
        subtitle={t("send.steps.step", { n: stepIndex + 1 })}
        onBack={flow.back}
        trailing={<TestnetBadge label={flow.chain.short} />}
      />
      <View style={styles.progress}>
        {SEND_STEPS.map((item, index) => (
          <View
            key={item}
            style={[
              styles.progressTrack,
              { backgroundColor: stepIndex >= index ? theme.colors.accent : theme.colors.surface3 },
            ]}
          />
        ))}
      </View>

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
                label={
                  blocked
                    ? t("send.confirm.blocked")
                    : flow.scanMismatch
                      ? t("send.confirm.scanMismatch")
                      : simStatus === "failed"
                        ? t("send.confirm.simFailed")
                        : t("send.confirm.cta")
                }
                icon={biometryIcon()}
                disabled={
                  blocked ||
                  flow.riskLoading ||
                  flow.scanMismatch ||
                  flow.simulationLoading ||
                  simStatus === "failed"
                }
                onPress={flow.startConfirm}
              />
            </FooterButton>
          </>
        )}
      </Animated.View>
    </Screen>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    progress: {
      flexDirection: "row",
      gap: 5,
      paddingHorizontal: theme.spacing.pad,
      paddingBottom: 8,
    },
    progressTrack: {
      flex: 1,
      height: 3,
      borderRadius: 9,
    },
    stepContainer: {
      flex: 1,
    },
  });
