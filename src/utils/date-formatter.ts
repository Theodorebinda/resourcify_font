/**
 * Date Formatter Utilities
 * 
 * Fonctions utilitaires pour formater les dates de manière cohérente
 * dans toute l'application.
 */

/**
 * Formate une date en format relatif (ex: "Il y a 2h") ou absolu (ex: "01/02/2026")
 * 
 * @param date - Date à formater (string ISO, Date, ou timestamp)
 * @returns String formatée (ex: "À l'instant", "Il y a 5 min", "Il y a 2h", "Il y a 3j", "01/02/2026")
 * 
 * @example
 * formatRelativeDate("2026-02-01T10:00:00Z") // "Il y a 2h"
 * formatRelativeDate(new Date()) // "À l'instant"
 * formatRelativeDate("2026-01-25T10:00:00Z") // "01/25/2026"
 */
export function formatRelativeDate(date: string | Date | number | null | undefined): string {
  // Gérer les valeurs nulles ou undefined
  if (!date) {
    return "Date inconnue";
  }

  // Convertir en Date si c'est une string ou un timestamp
  let dateObj: Date;
  if (typeof date === "string") {
    dateObj = new Date(date);
  } else if (typeof date === "number") {
    dateObj = new Date(date);
  } else {
    dateObj = date;
  }

  // Vérifier si la date est valide
  if (isNaN(dateObj.getTime())) {
    return "Date invalide";
  }

  const now = new Date();
  const diff = now.getTime() - dateObj.getTime();

  // Si la date est dans le futur, retourner la date formatée
  if (diff < 0) {
    return dateObj.toLocaleDateString("fr-FR");
  }

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  // Moins d'une minute
  if (minutes < 1) {
    return "À l'instant";
  }

  // Moins d'une heure
  if (minutes < 60) {
    return `Il y a ${minutes} min`;
  }

  // Moins de 24 heures
  if (hours < 24) {
    return `Il y a ${hours}h`;
  }

  // Moins de 7 jours
  if (days < 7) {
    return `Il y a ${days}j`;
  }

  // Moins de 30 jours
  if (days < 30) {
    return `Il y a ${weeks} semaine${weeks > 1 ? "s" : ""}`;
  }

  // Moins d'un an
  if (days < 365) {
    return `Il y a ${months} mois`;
  }

  // Plus d'un an - afficher la date complète
  return dateObj.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * Formate une date en format complet avec heure
 * 
 * @param date - Date à formater (string ISO, Date, ou timestamp)
 * @returns String formatée (ex: "01/02/2026 à 14:30")
 */
export function formatFullDate(date: string | Date | number | null | undefined): string {
  if (!date) {
    return "Date inconnue";
  }

  let dateObj: Date;
  if (typeof date === "string") {
    dateObj = new Date(date);
  } else if (typeof date === "number") {
    dateObj = new Date(date);
  } else {
    dateObj = date;
  }

  if (isNaN(dateObj.getTime())) {
    return "Date invalide";
  }

  return dateObj.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Formate une date en format court (jour/mois)
 * 
 * @param date - Date à formater (string ISO, Date, ou timestamp)
 * @returns String formatée (ex: "01/02")
 */
export function formatShortDate(date: string | Date | number | null | undefined): string {
  if (!date) {
    return "Date inconnue";
  }

  let dateObj: Date;
  if (typeof date === "string") {
    dateObj = new Date(date);
  } else if (typeof date === "number") {
    dateObj = new Date(date);
  } else {
    dateObj = date;
  }

  if (isNaN(dateObj.getTime())) {
    return "Date invalide";
  }

  return dateObj.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
  });
}
