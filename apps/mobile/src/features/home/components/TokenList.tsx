import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { AppText, Card, ChangeBadge, Row, SectionLabel, Skeleton, TokenGlyph } from "@/components";
import { chainBadgeColor, type PortfolioToken } from "@/features/wallet/data";
import { useTranslation } from "@/i18n/useTranslation";
import { useTheme, useThemedStyles, type Theme } from "@/theme";
import { getTokenAmount, getTokenValue } from "../home.utils";

interface TokenListProps {
  onManage: () => void;
  loading: boolean;
  tokens: PortfolioToken[];
  hidden: boolean;
  priceUnavailable: boolean;
  onTokenPress: (tokenId: string) => void;
}

export function TokenList({
  onManage,
  loading,
  tokens,
  hidden,
  priceUnavailable,
  onTokenPress,
}: TokenListProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();

  return (
    <View style={[styles.section, styles.tokenSection]}>
      <SectionLabel
        trailing={
          <Pressable accessibilityRole="button" hitSlop={8} onPress={onManage}>
            <AppText weight="semibold" size={13} color={theme.colors.accent}>
              {t("common.actions.manage")}
            </AppText>
          </Pressable>
        }
      >
        {t("home.tokens")}
      </SectionLabel>
      <Card padding={0} style={styles.cardInset}>
        {loading ? (
          <Skeleton width="100%" height={115} />
        ) : (
          tokens.map((token, index) => (
            <Row
              key={token.id}
              last={index === tokens.length - 1}
              onPress={() => onTokenPress(token.id)}
              left={
                <TokenGlyph
                  symbol={token.symbol}
                  color={token.color}
                  chainColor={chainBadgeColor(token.chain)}
                />
              }
              title={token.name}
              sub={
                <AppText size={13} muted tnum>
                  {getTokenAmount(token, hidden)}
                </AppText>
              }
              right={getTokenValue(token, hidden, priceUnavailable)}
              rightSub={
                priceUnavailable ? undefined : <ChangeBadge pct={token.change} size={12} plain />
              }
            />
          ))
        )}
      </Card>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    section: {
      paddingHorizontal: theme.spacing.pad,
      paddingBottom: 14,
    },
    tokenSection: {
      paddingTop: 22,
    },
    cardInset: {
      paddingHorizontal: 16,
    },
  });
