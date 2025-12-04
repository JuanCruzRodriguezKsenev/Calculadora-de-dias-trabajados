from datetime import date, timedelta
import calendar
import sys

# --- FUNCIONES DE CÁLCULO ---

def calcular_periodo_individual(fecha_inicio, fecha_fin):
    """
    Calcula la antigüedad de UN periodo específico.
    Usa calendario real y suma 1 día para ser inclusivo.
    """
    # Ajuste inclusivo: sumamos 1 día a la fecha final para contar el día de salida
    fecha_fin_ajustada = fecha_fin + timedelta(days=1)
    
    anios = fecha_fin_ajustada.year - fecha_inicio.year
    meses = fecha_fin_ajustada.month - fecha_inicio.month
    dias = fecha_fin_ajustada.day - fecha_inicio.day

    # Ajuste de días negativos
    if dias < 0:
        meses -= 1
        # Volvemos al mes anterior para ver cuántos días tenía
        mes_anterior = fecha_fin_ajustada.month - 1
        anio_referencia = fecha_fin_ajustada.year
        if mes_anterior == 0:
            mes_anterior = 12
            anio_referencia -= 1
        
        _, dias_del_mes_anterior = calendar.monthrange(anio_referencia, mes_anterior)
        dias += dias_del_mes_anterior

    # Ajuste de meses negativos
    if meses < 0:
        anios -= 1
        meses += 12

    return anios, meses, dias

def sumar_todos_los_periodos(lista_periodos):
    """
    Suma una lista de tuplas (año, mes, dia).
    Normaliza usando criterio comercial: 30 días = 1 mes, 12 meses = 1 año.
    """
    total_a, total_m, total_d = 0, 0, 0
    
    # 1. Suma bruta
    for a, m, d in lista_periodos:
        total_a += a
        total_m += m
        total_d += d
        
    # 2. Normalizar Días (Base 30)
    meses_extra, dias_restantes = divmod(total_d, 30)
    total_m += meses_extra
    total_d = dias_restantes
    
    # 3. Normalizar Meses (Base 12)
    anios_extra, meses_restantes = divmod(total_m, 12)
    total_a += anios_extra
    total_m = meses_restantes
    
    return total_a, total_m, total_d

# --- PROGRAMA PRINCIPAL ---

def main():
    print("==================================================")
    print("   SISTEMA DE CÁLCULO DE ANTIGÜEDAD LABORAL")
    print("   (Modo Inclusivo + Suma Comercial)")
    print("==================================================")
    
    periodos_guardados = []
    
    while True:
        print(f"\n--- INGRESANDO PERIODO #{len(periodos_guardados) + 1} ---")
        
        try:
            # Entrada de datos
            f_ini_str = input("Fecha de Ingreso (DD/MM/AAAA): ")
            f_fin_str = input("Fecha de Egreso  (DD/MM/AAAA): ")
            
            # Conversión
            d1, m1, a1 = map(int, f_ini_str.split('/'))
            d2, m2, a2 = map(int, f_fin_str.split('/'))
            
            inicio = date(a1, m1, d1)
            fin = date(a2, m2, d2)
            
            # Validación
            if inicio > fin:
                print(">> ERROR: La fecha de inicio es posterior a la de egreso. Intente nuevamente.")
                continue
            
            # Cálculo del periodo actual
            a, m, d = calcular_periodo_individual(inicio, fin)
            
            # Guardamos el resultado en la lista
            periodos_guardados.append((a, m, d))
            
            print(f"   -> Periodo calculado: {a} años, {m} meses, {d} días.")
            
            # Preguntar si desea continuar
            continuar = input("\n¿Desea agregar otro periodo? (S/N): ").strip().lower()
            if continuar != 's':
                break
                
        except ValueError:
            print(">> ERROR: Formato incorrecto. Asegúrese de usar DD/MM/AAAA (ej: 01/05/2020).")
            
    # --- RESULTADO FINAL ---
    if periodos_guardados:
        t_a, t_m, t_d = sumar_todos_los_periodos(periodos_guardados)
        
        print("\n" + "="*40)
        print(f"RESUMEN FINAL ({len(periodos_guardados)} periodos sumados)")
        print("="*40)
        print(f"ANTIGÜEDAD TOTAL: {t_a} AÑOS, {t_m} MESES y {t_d} DÍAS")
        print("="*40)
        
        # Pausa para que no se cierre la ventana inmediatamente en Windows
        input("\nPresione ENTER para salir...")
    else:
        print("\nNo se ingresaron periodos.")

if __name__ == "__main__":
    main()