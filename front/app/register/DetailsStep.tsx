/**
 * 티켓 상세 정보 입력 단계 컴포넌트
 */

import { View, TextInput, ScrollView } from "react-native";
import { Text } from "../../shared/ui/Text";
import { Button } from "../../shared/ui/Button";
import { colors } from "../../theme/design-tokens";
import { Game, TicketFormData, YMDDate } from "../../shared/types";
import { useState, useEffect } from "react";
import { YMDToDisplayDate } from "../../shared/utils/date";

interface DetailsStepProps {
  setStep: (step: number) => void;
  selectedGame: Game | null;
  date: YMDDate;
  form: TicketFormData;
  setForm: (form: TicketFormData) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

export function DetailsStep({ 
  setStep, 
  selectedGame, 
  date,
  form, 
  setForm, 
  onSubmit, 
  isSubmitting = false 
}: DetailsStepProps) {
  const [errors, setErrors] = useState<Partial<TicketFormData>>({});

  // 폼 유효성 검사
  const validateForm = (): boolean => {
    const newErrors: Partial<TicketFormData> = {};

    if (!form.section.trim()) {
      newErrors.section = "구역을 입력해주세요";
    }

    if (!form.row.trim()) {
      newErrors.row = "열을 입력해주세요";
    }

    if (!form.seat_label.trim()) {
      newErrors.seat_label = "좌석 번호를 입력해주세요";
    }

    if (!form.price.trim()) {
      newErrors.price = "가격을 입력해주세요";
    } else {
      const price = parseInt(form.price);
      if (isNaN(price) || price <= 0) {
        newErrors.price = "올바른 가격을 입력해주세요";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit();
    }
  };

  const updateForm = (field: keyof TicketFormData, value: string) => {
    setForm({ ...form, [field]: value });
    // 에러 메시지 제거
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  return (
    <>
      <View style={{ flex: 1, padding: 16 }}>
        <View style={{ gap: 16 }}>
          {/* 선택된 경기 정보 */}
          <View style={{ paddingHorizontal: 8 }}>
            <Text variant="display">티켓 정보를 입력해주세요</Text>
            <Text style={{ marginTop: 8, color: colors.gray500 }}>{YMDToDisplayDate(date)}</Text>
          </View>
            {selectedGame && (
              <View style={{ 
                padding: 12, 
                backgroundColor: colors.gray50, 
                borderRadius: 8 
              }}>
                <Text style={{ fontWeight: "600", color: colors.gray800 }}>
                  {selectedGame.home_team_name} vs {selectedGame.away_team_name}
                </Text>
                <Text style={{ marginTop: 4, color: colors.gray600 }}>
                  {selectedGame.start_time_local} • {selectedGame.stadium}
                </Text>
              </View>
            )}

          {/* 좌석 정보 입력 */}
          <ScrollView>
            <View style={{ gap: 16 }}>
            <View>
              <Text style={{ marginBottom: 8, fontWeight: "600" }}>구역 *</Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: errors.section ? colors.danger : colors.gray300,
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 16,
                  backgroundColor: colors.white,
                }}
                placeholder="예: 220구역, 221구역"
                value={form.section}
                onChangeText={(text) => updateForm('section', text)}
                maxLength={20}
              />
              {errors.section && (
                <Text style={{ color: colors.danger, fontSize: 12, marginTop: 4 }}>
                  {errors.section}
                </Text>
              )}
            </View>

            <View>
              <Text style={{ marginBottom: 8, fontWeight: "600" }}>열 *</Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: errors.row ? colors.danger : colors.gray300,
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 16,
                  backgroundColor: colors.white,
                }}
                placeholder="예: A열, B열, 1열"
                value={form.row}
                onChangeText={(text) => updateForm('row', text)}
                maxLength={10}
              />
              {errors.row && (
                <Text style={{ color: colors.danger, fontSize: 12, marginTop: 4 }}>
                  {errors.row}
                </Text>
              )}
            </View>

            <View>
              <Text style={{ marginBottom: 8, fontWeight: "600" }}>좌석 번호 *</Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: errors.seat_label ? colors.danger : colors.gray300,
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 16,
                  backgroundColor: colors.white,
                }}
                placeholder="예: 1번, 15번, 101번"
                value={form.seat_label}
                onChangeText={(text) => updateForm('seat_label', text)}
                maxLength={10}
              />
              {errors.seat_label && (
                <Text style={{ color: colors.danger, fontSize: 12, marginTop: 4 }}>
                  {errors.seat_label}
                </Text>
              )}
            </View>

            <View>
              <Text style={{ marginBottom: 8, fontWeight: "600" }}>가격 (원) *</Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: errors.price ? colors.danger : colors.gray300,
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 16,
                  backgroundColor: colors.white,
                }}
                placeholder="예: 15000"
                value={form.price}
                onChangeText={(text) => updateForm('price', text)}
                keyboardType="numeric"
                maxLength={10}
              />
              {errors.price && (
                <Text style={{ color: colors.danger, fontSize: 12, marginTop: 4 }}>
                  {errors.price}
                </Text>
              )}
            </View>

            <View>
              <Text style={{ marginBottom: 8, fontWeight: "600" }}>설명 (선택사항)</Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: colors.gray300,
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 16,
                  backgroundColor: colors.white,
                  height: 80,
                  textAlignVertical: 'top',
                }}
                placeholder="티켓에 대한 추가 설명을 입력해주세요"
                value={form.note}
                onChangeText={(text) => updateForm('note', text)}
                multiline
                maxLength={200}
              />
              <Text style={{ color: colors.gray500, fontSize: 12, marginTop: 4, textAlign: 'right' }}>
                {form.note.length}/200
              </Text>
            </View>
            </View>
          </ScrollView>
        </View>
      </View>
      
      <View style={{ 
        position: "absolute", 
        display: "flex", 
        flexDirection: "row", 
        gap: 16, 
        padding: 16, 
        paddingBottom: 48, 
        bottom: 0, 
        width: "100%", 
        backgroundColor: colors.white
      }}>
        <Button
          title="이전"
          size="lg"
          variant="secondary"
          onPress={() => setStep(2)}
          style={{ flex: 1 }}
        />
        <Button
          title={isSubmitting ? "등록 중..." : "등록하기"}
          size="lg"
          onPress={handleSubmit}
          style={{ flex: 1 }}
          disabled={isSubmitting}
        />
      </View>
    </>
  );
}
