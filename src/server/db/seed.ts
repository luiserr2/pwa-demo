import 'reflect-metadata';
import { DataSource } from 'typeorm';
import {
  User,
  RolUsuario,
  Radiobase,
  Reporte,
  EstadoReporte,
  ZonaMatriz,
  EvidenciaFotografica,
  MomentoFoto,
  EstadoValidacionVisual,
  EquipoInstalado,
} from '../entities';
import { getDataSource } from './data-source';

export async function seedDatabase(ds?: DataSource) {
  const dataSource = ds || (await getDataSource());

  const userRepo = dataSource.getRepository(User);
  const radiobaseRepo = dataSource.getRepository(Radiobase);
  const reporteRepo = dataSource.getRepository(Reporte);
  const zonaRepo = dataSource.getRepository(ZonaMatriz);
  const evidenciaRepo = dataSource.getRepository(EvidenciaFotografica);
  const equipoRepo = dataSource.getRepository(EquipoInstalado);

  console.log('🌱 Iniciando carga de datos semilla (Market-Ready Seed)...');

  // 1. Usuarios
  let tecnico = await userRepo.findOneBy({ email: 'tecnico@sisbirceca.com' });
  if (!tecnico) {
    tecnico = await userRepo.save(
      userRepo.create({
        email: 'tecnico@sisbirceca.com',
        nombre: 'Gerson Martínez',
        cedula: 'V-24.891.203',
        rol: RolUsuario.TECNICO,
        activo: true,
      })
    );
  }

  let supervisor = await userRepo.findOneBy({ email: 'supervisor@sisbirceca.com' });
  if (!supervisor) {
    supervisor = await userRepo.save(
      userRepo.create({
        email: 'supervisor@sisbirceca.com',
        nombre: 'Ing. Roberto Silva',
        cedula: 'V-18.442.109',
        rol: RolUsuario.SUPERVISOR,
        activo: true,
      })
    );
  }

  let admin = await userRepo.findOneBy({ email: 'admin@sisbirceca.com' });
  if (!admin) {
    admin = await userRepo.save(
      userRepo.create({
        email: 'admin@sisbirceca.com',
        nombre: 'Dirección de Operaciones',
        cedula: 'V-12.345.678',
        rol: RolUsuario.ADMIN,
        activo: true,
      })
    );
  }

  // 2. Radiobases
  const radiobasesData = [
    {
      codigo: 'RDB-001',
      nombre: 'Torre Puerto Madero',
      region: 'AMBA / CABA',
      tecnologia: '4G / 5G LTE',
      tipoTorre: 'Mástil Autosoportado',
    },
    {
      codigo: 'RDB-002',
      nombre: 'Cerro Catedral Repetidor',
      region: 'Patagonia Norte',
      tecnologia: '4G LTE / Microondas',
      tipoTorre: 'Monopolo Pesado',
    },
    {
      codigo: 'RDB-003',
      nombre: 'Córdoba Sierras Repetidor',
      region: 'Centro',
      tecnologia: '5G Ready',
      tipoTorre: 'Torre Arriostrada',
    },
    {
      codigo: 'RDB-004',
      nombre: 'Palermo Soho Microcelda',
      region: 'CABA Norte',
      tecnologia: 'Small Cell 5G',
      tipoTorre: 'Poste Urbano',
    },
  ];

  const radiobasesMap = new Map<string, Radiobase>();
  for (const rData of radiobasesData) {
    let r = await radiobaseRepo.findOneBy({ codigo: rData.codigo });
    if (!r) {
      r = await radiobaseRepo.save(radiobaseRepo.create(rData));
    }
    radiobasesMap.set(r.codigo, r);
  }

  // 3. Reporte Semilla en estado EN_REVISION con 48 zonas y 6 pares de fotos
  const rdb1 = radiobasesMap.get('RDB-001')!;
  const codigoReporte1 = 'RDB-001_20260922';
  let reporte1 = await reporteRepo.findOne({
    where: { codigo: codigoReporte1 },
    relations: ['evidencias', 'zonas', 'equipos'],
  });

  if (!reporte1) {
    reporte1 = await reporteRepo.save(
      reporteRepo.create({
        codigo: codigoReporte1,
        estado: EstadoReporte.EN_REVISION,
        radiobaseId: rdb1.id,
        tecnicoId: tecnico.id,
        supervisorId: supervisor.id,
        fechaVisita: new Date('2026-09-22T09:00:00Z'),
        observaciones: 'Mantenimiento preventivo semestral completado sin novedad en cableado.',
        datosRed: {
          ipWan: '190.210.45.12',
          ipLan: '192.168.100.1',
          gateway: '190.210.45.1',
          mascara: '255.255.255.248',
          vlanId: '104',
          dns1: '8.8.8.8',
          dns2: '1.1.1.1',
        },
      })
    );

    // Inicializar 48 zonas
    const zonas: ZonaMatriz[] = [];
    for (let i = 1; i <= 48; i++) {
      zonas.push(
        zonaRepo.create({
          reporteId: reporte1.id,
          numeroZona: i,
          descripcion:
            i === 1
              ? 'PIR Entrada Principal'
              : i === 2
              ? 'Magnético Puerta Torre'
              : i === 3
              ? 'Sensor Sísmico Baterías'
              : `Zona ${i}`,
          estado: i === 3 ? 'ALARMA' : 'OK',
        })
      );
    }
    await zonaRepo.save(zonas);

    // 6 pares de fotos (Antes / Después)
    const fotosData = [
      { tipo: 'CAMARA', slot: 1, antes: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80', despues: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80', validacion: EstadoValidacionVisual.APROBADO },
      { tipo: 'PIR', slot: 2, antes: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80', despues: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=600&auto=format&fit=crop&q=80', validacion: EstadoValidacionVisual.PENDIENTE },
      { tipo: 'BOTON', slot: 3, antes: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=600&auto=format&fit=crop&q=80', despues: 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=600&auto=format&fit=crop&q=80', validacion: EstadoValidacionVisual.PENDIENTE },
      { tipo: 'TECLADO', slot: 4, antes: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=600&auto=format&fit=crop&q=80', despues: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80', validacion: EstadoValidacionVisual.PENDIENTE },
      { tipo: 'DVR', slot: 5, antes: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=600&auto=format&fit=crop&q=80', despues: 'https://images.unsplash.com/photo-1581092162384-8987c1d64718?w=600&auto=format&fit=crop&q=80', validacion: EstadoValidacionVisual.PENDIENTE },
      { tipo: 'TABLERO', slot: 6, antes: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&auto=format&fit=crop&q=80', despues: 'https://images.unsplash.com/photo-1581092787765-7351c2807e3d?w=600&auto=format&fit=crop&q=80', validacion: EstadoValidacionVisual.PENDIENTE },
    ];

    const evidencias: EvidenciaFotografica[] = [];
    for (const f of fotosData) {
      evidencias.push(
        evidenciaRepo.create({
          reporteId: reporte1.id,
          tipoEquipo: f.tipo,
          slotNumero: f.slot,
          momento: MomentoFoto.ANTES,
          urlImagen: f.antes,
          estadoValidacion: f.validacion,
        })
      );
      evidencias.push(
        evidenciaRepo.create({
          reporteId: reporte1.id,
          tipoEquipo: f.tipo,
          slotNumero: f.slot,
          momento: MomentoFoto.DESPUES,
          urlImagen: f.despues,
          estadoValidacion: f.validacion,
        })
      );
    }
    await evidenciaRepo.save(evidencias);

    // Equipos instalados
    const equipos = [
      equipoRepo.create({
        reporteId: reporte1.id,
        descripcion: 'Panel de Alarma Híbrido AX PRO',
        modelo: 'DS-PHA64-LP',
        serial: 'HKV-2026-9921',
        cantidad: 1,
      }),
      equipoRepo.create({
        reporteId: reporte1.id,
        descripcion: 'Cámara Domo IP 4K ColorVu',
        modelo: 'DS-2CD2187G2-LSU',
        serial: 'HKV-CAM-8831',
        cantidad: 2,
      }),
    ];
    await equipoRepo.save(equipos);
  }

  console.log('✅ Base de datos inicializada y certificada para producción.');
}

if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Error durante el seed:', err);
      process.exit(1);
    });
}
