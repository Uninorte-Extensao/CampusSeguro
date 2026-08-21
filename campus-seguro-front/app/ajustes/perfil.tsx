import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import {
    ConfigScreen,
    InputField,
    PrimaryButton,
} from "../../components/configuracoes/ConfigTelaBase";

export default function PerfilScreen() {
  const [nome, setNome] = useState("Gustavo Assí");
  const [email, setEmail] = useState("gustavo@email.com");
  const [telefone, setTelefone] = useState("(92) 99999-9999");

  return (
    <ConfigScreen title="Perfil" subtitle="Edite suas informações pessoais.">
      <View style={styles.card}>
        <View style={styles.avatarArea}>
          <View style={styles.avatar}>
            <Feather name="user" size={54} color="#0F172A" />
          </View>

          <TouchableOpacity style={styles.editAvatarButton} activeOpacity={0.75}>
            <Feather name="edit-2" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <InputField
          label="Nome"
          icon="user"
          value={nome}
          onChangeText={setNome}
          placeholder="Digite seu nome"
        />

        <InputField
          label="E-mail"
          icon="mail"
          value={email}
          onChangeText={setEmail}
          placeholder="Digite seu e-mail"
          keyboardType="email-address"
        />

        <InputField
          label="Telefone"
          icon="phone"
          value={telefone}
          onChangeText={setTelefone}
          placeholder="Digite seu telefone"
          keyboardType="phone-pad"
        />

        <PrimaryButton label="Salvar" />
      </View>
    </ConfigScreen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(25, 33, 52, 0.9)",
    borderWidth: 1,
    borderColor: "rgba(94, 111, 145, 0.32)",
    borderRadius: 30,
    padding: 24,
    marginBottom: 28,
  },

  avatarArea: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 34,
  },

  avatar: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: "#B9E4D1",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#3978FF",
    shadowOpacity: 0.6,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },

  editAvatarButton: {
    position: "absolute",
    right: "31%",
    bottom: 2,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#3978FF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#1B2440",
  },
});