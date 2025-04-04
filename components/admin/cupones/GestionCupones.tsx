"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import {
  Box,
  Button,
  Flex,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
  FormErrorMessage,
  Switch,
  Tooltip,
  useToast,
} from "@chakra-ui/react"
import { FiEdit, FiTrash2, FiPlus } from "react-icons/fi"

interface Cupon {
  id: number
  codigo: string
  descripcion: string
  porcentajeDesc: number | null
  montoDesc: number | null
  montoMinimo: number | null
  fechaInicio: Date
  fechaExpiracion: Date | null
  usoMaximo: number | null
  usosActuales: number
  activo: boolean
}

const GestionCupones: React.FC = () => {
  const [cupones, setCupones] = useState<Cupon[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [cuponEditando, setCuponEditando] = useState<Partial<Cupon> | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()
  const modalSizeRef = useRef("xl")
  const modalSize = { base: "full", md: "xl" }

  // Cargar cupones
  useEffect(() => {
    const fetchCupones = async () => {
      try {
        const response = await fetch("/api/cupones")
        if (!response.ok) {
          throw new Error("Error al cargar cupones")
        }
        const data = await response.json()
        // Verificar si la respuesta es un array (API devuelve directamente los cupones)
        // o si es un objeto con una propiedad cupones
        setCupones(Array.isArray(data) ? data : data.cupones || [])
        console.log("Datos recibidos:", data)
      } catch (error) {
        console.error("Error:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los cupones.",
          status: "error",
          duration: 5000,
          isClosable: true,
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchCupones()
  }, [toast])

  // Formatear fecha para input date
  const formatDateForInput = (date: Date | null | string): string => {
    if (!date) return ""
    const d = typeof date === "string" ? new Date(date) : date
    return d instanceof Date && !isNaN(d.getTime()) ? d.toISOString().split("T")[0] : ""
  }

  // Validar formulario
  const validarFormulario = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!cuponEditando?.codigo?.trim()) {
      newErrors.codigo = "El código es requerido"
    }

    if (!cuponEditando?.descripcion?.trim()) {
      newErrors.descripcion = "La descripción es requerida"
    }

    if (!cuponEditando?.porcentajeDesc && !cuponEditando?.montoDesc) {
      newErrors.descuento = "Debe especificar un porcentaje o un monto de descuento"
    }

    if (!cuponEditando?.fechaInicio) {
      newErrors.fechaInicio = "La fecha de inicio es requerida"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Abrir modal para nuevo cupón
  const handleNuevoCupon = () => {
    setCuponEditando({
      codigo: "",
      descripcion: "",
      porcentajeDesc: null,
      montoDesc: null,
      montoMinimo: null,
      fechaInicio: new Date(),
      fechaExpiracion: null,
      usoMaximo: null,
      usosActuales: 0,
      activo: true,
    })
    setErrors({})
    onOpen()
  }

  // Abrir modal para editar cupón
  const handleEditarCupon = (cupon: Cupon) => {
    setCuponEditando({
      ...cupon,
      fechaInicio: new Date(cupon.fechaInicio),
      fechaExpiracion: cupon.fechaExpiracion ? new Date(cupon.fechaExpiracion) : null,
    })
    setErrors({})
    onOpen()
  }

  // Eliminar cupón
  const handleEliminarCupon = async (id: number) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este cupón?")) {
      try {
        const response = await fetch(`/api/cupones?id=${id}`, {
          method: "DELETE",
        })

        if (!response.ok) {
          throw new Error("Error al eliminar el cupón")
        }

        // Actualizar la lista de cupones
        setCupones(cupones.filter((c) => c.id !== id))

        toast({
          title: "Éxito",
          description: "Cupón eliminado correctamente.",
          status: "success",
          duration: 3000,
          isClosable: true,
        })
      } catch (error) {
        console.error("Error:", error)
        toast({
          title: "Error",
          description: "No se pudo eliminar el cupón.",
          status: "error",
          duration: 5000,
          isClosable: true,
        })
      }
    }
  }

  // Guardar cupón (crear o actualizar)
  const handleGuardarCupon = async () => {
    if (!validarFormulario()) {
      return
    }

    try {
      const method = cuponEditando?.id ? "PUT" : "POST"
      const url = "/api/cupones"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cuponEditando),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al guardar el cupón")
      }

      const data = await response.json()

      // Actualizar la lista de cupones
      if (cuponEditando?.id) {
        setCupones(cupones.map((c) => (c.id === data.cupon.id ? data.cupon : c)))
      } else {
        setCupones([...cupones, data.cupon])
      }

      toast({
        title: "Éxito",
        description: `Cupón ${cuponEditando?.id ? "actualizado" : "creado"} correctamente.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      })

      onClose()
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: `No se pudo ${cuponEditando?.id ? "actualizar" : "crear"} el cupón.`,
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    }
  }

  // Cambiar valores del cupón en edición
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    let newValue: any = value

    if (type === "checkbox") {
      newValue = checked
    } else if (type === "number") {
      newValue = value ? Number(value) : null
    } else if (name === "fechaInicio" || name === "fechaExpiracion") {
      newValue = value ? new Date(value) : null
    }

    setCuponEditando((prev) => (prev ? { ...prev, [name]: newValue } : null))
  }

  return (
    <Box p={5}>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg" color="red.500">
          Gestión de Cupones
        </Heading>
        <Button leftIcon={<FiPlus />} colorScheme="green" onClick={handleNuevoCupon}>
          Nuevo Cupón
        </Button>
      </Flex>

      {isLoading ? (
        <Box textAlign="center" py={10}>
          Cargando cupones...
        </Box>
      ) : cupones.length === 0 ? (
        <Box textAlign="center" py={10}>
          No hay cupones disponibles.
        </Box>
      ) : (
        <Table variant="simple" colorScheme="gray">
          <Thead>
            <Tr>
              <Th>Código</Th>
              <Th>Descripción</Th>
              <Th>Descuento</Th>
              <Th>Vigencia</Th>
              <Th>Usos</Th>
              <Th>Estado</Th>
              <Th>Acciones</Th>
            </Tr>
          </Thead>
          <Tbody>
            {cupones.map((cupon) => (
              <Tr key={cupon.id}>
                <Td fontWeight="bold">{cupon.codigo}</Td>
                <Td>{cupon.descripcion}</Td>
                <Td>
                  {cupon.porcentajeDesc ? `${cupon.porcentajeDesc}%` : ""}
                  {cupon.montoDesc ? `$${typeof cupon.montoDesc === 'number' ? cupon.montoDesc.toFixed(2) : cupon.montoDesc}` : ""}
                </Td>
                <Td>
                  {new Date(cupon.fechaInicio).toLocaleDateString()}
                  {cupon.fechaExpiracion
                    ? ` - ${new Date(cupon.fechaExpiracion).toLocaleDateString()}`
                    : " - Sin vencimiento"}
                </Td>
                <Td>
                  {cupon.usosActuales}
                  {cupon.usoMaximo ? `/${cupon.usoMaximo}` : ""}
                </Td>
                <Td>
                  <Badge colorScheme={cupon.activo ? "green" : "red"} variant="solid" px={2} py={1} borderRadius="full">
                    {cupon.activo ? "Activo" : "Inactivo"}
                  </Badge>
                </Td>
                <Td>
                  <Flex>
                    <Tooltip label="Editar">
                      <IconButton
                        icon={<FiEdit />}
                        aria-label="Editar"
                        colorScheme="blue"
                        size="sm"
                        mr={2}
                        onClick={() => handleEditarCupon(cupon)}
                      />
                    </Tooltip>
                    <Tooltip label="Eliminar">
                      <IconButton
                        icon={<FiTrash2 />}
                        aria-label="Eliminar"
                        colorScheme="red"
                        size="sm"
                        onClick={() => handleEliminarCupon(cupon.id)}
                      />
                    </Tooltip>
                  </Flex>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}

      {/* Modal para crear/editar cupón */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered motionPreset="slideInBottom">
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(5px)" />
        <ModalContent
          width="auto"
          maxW="480px"
          mx="auto"
          my="auto"
          maxH="90vh"
          overflowY="auto"
          borderRadius="lg"
          boxShadow="2xl"
          border="1px solid"
          borderColor="gray.100"
        >
          <ModalHeader
            fontSize="lg"
            fontWeight="bold"
            borderBottomWidth="1px"
            pb={3}
            bg="red.500"
            color="white"
            borderTopRadius="lg"
            display="flex"
            alignItems="center"
            gap={2}
          >
            {cuponEditando?.id ? <FiEdit size={18} /> : <FiPlus size={18} />}
            {cuponEditando?.id ? "Editar Cupón" : "Nuevo Cupón"}
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody py={6} px={5} bg="white">
            <FormControl isInvalid={!!errors.codigo} mb={5}>
              <FormLabel fontWeight="medium" color="gray.700">
                Código
              </FormLabel>
              <Input
                name="codigo"
                value={cuponEditando?.codigo || ""}
                onChange={handleInputChange}
                placeholder="Ej: VERANO2023"
                bg="gray.50"
                borderColor="gray.300"
                _hover={{ borderColor: "gray.400" }}
                _focus={{ borderColor: "red.400", boxShadow: "0 0 0 1px var(--chakra-colors-red-400)" }}
                fontSize="md"
              />
              {errors.codigo && <FormErrorMessage>{errors.codigo}</FormErrorMessage>}
            </FormControl>

            <FormControl isInvalid={!!errors.descripcion} mb={5}>
              <FormLabel fontWeight="medium" color="gray.700">
                Descripción
              </FormLabel>
              <Input
                name="descripcion"
                value={cuponEditando?.descripcion || ""}
                onChange={handleInputChange}
                placeholder="Ej: Descuento de verano"
                bg="gray.50"
                borderColor="gray.300"
                _hover={{ borderColor: "gray.400" }}
                _focus={{ borderColor: "red.400", boxShadow: "0 0 0 1px var(--chakra-colors-red-400)" }}
                fontSize="md"
              />
              {errors.descripcion && <FormErrorMessage>{errors.descripcion}</FormErrorMessage>}
            </FormControl>

            <FormControl isInvalid={!!errors.descuento} mb={5}>
              <FormLabel fontWeight="medium" color="gray.700" mb={3}>
                Tipo de Descuento
              </FormLabel>
              <Flex gap={4} flexDirection="column">
                <Box p={3} borderWidth="1px" borderColor="gray.200" borderRadius="md" bg="gray.50">
                  <FormLabel fontSize="sm" color="gray.700" mb={1} fontWeight="medium">
                    Porcentaje (%)
                  </FormLabel>
                  <NumberInput min={0} max={100} size="md">
                    <NumberInputField
                      name="porcentajeDesc"
                      value={cuponEditando?.porcentajeDesc || ""}
                      onChange={handleInputChange}
                      placeholder="Ej: 15"
                      borderColor="gray.300"
                      _hover={{ borderColor: "gray.400" }}
                      _focus={{ borderColor: "red.400", boxShadow: "0 0 0 1px var(--chakra-colors-red-400)" }}
                    />
                  </NumberInput>
                </Box>
                <Box p={3} borderWidth="1px" borderColor="gray.200" borderRadius="md" bg="gray.50">
                  <FormLabel fontSize="sm" color="gray.700" mb={1} fontWeight="medium">
                    Monto Fijo ($)
                  </FormLabel>
                  <NumberInput min={0} size="md">
                    <NumberInputField
                      name="montoDesc"
                      value={cuponEditando?.montoDesc || ""}
                      onChange={handleInputChange}
                      placeholder="Ej: 100.00"
                      borderColor="gray.300"
                      _hover={{ borderColor: "gray.400" }}
                      _focus={{ borderColor: "red.400", boxShadow: "0 0 0 1px var(--chakra-colors-red-400)" }}
                    />
                  </NumberInput>
                </Box>
              </Flex>
              {errors.descuento && <FormErrorMessage>{errors.descuento}</FormErrorMessage>}
            </FormControl>

            <FormControl mb={5}>
              <FormLabel fontWeight="medium" color="gray.700">
                Monto Mínimo de Compra
              </FormLabel>
              <NumberInput min={0} size="md">
                <NumberInputField
                  name="montoMinimo"
                  value={cuponEditando?.montoMinimo || ""}
                  onChange={handleInputChange}
                  placeholder="Ej: 500.00"
                  bg="gray.50"
                  borderColor="gray.300"
                  _hover={{ borderColor: "gray.400" }}
                  _focus={{ borderColor: "red.400", boxShadow: "0 0 0 1px var(--chakra-colors-red-400)" }}
                />
              </NumberInput>
            </FormControl>

            <Flex gap={4} mb={5} flexDirection={{ base: "column", md: "row" }}>
              <FormControl isInvalid={!!errors.fechaInicio} flex="1">
                <FormLabel fontWeight="medium" color="gray.700">
                  Fecha de Inicio
                </FormLabel>
                <Input
                  type="date"
                  name="fechaInicio"
                  value={formatDateForInput(cuponEditando?.fechaInicio || "")}
                  onChange={handleInputChange}
                  size="md"
                  bg="gray.50"
                  borderColor="gray.300"
                  _hover={{ borderColor: "gray.400" }}
                  _focus={{ borderColor: "red.400", boxShadow: "0 0 0 1px var(--chakra-colors-red-400)" }}
                />
                {errors.fechaInicio && <FormErrorMessage>{errors.fechaInicio}</FormErrorMessage>}
              </FormControl>
              <FormControl flex="1">
                <FormLabel fontWeight="medium" color="gray.700">
                  Fecha de Expiración
                </FormLabel>
                <Input
                  type="date"
                  name="fechaExpiracion"
                  value={formatDateForInput(cuponEditando?.fechaExpiracion || "")}
                  onChange={handleInputChange}
                  size="md"
                  bg="gray.50"
                  borderColor="gray.300"
                  _hover={{ borderColor: "gray.400" }}
                  _focus={{ borderColor: "red.400", boxShadow: "0 0 0 1px var(--chakra-colors-red-400)" }}
                />
              </FormControl>
            </Flex>

            <FormControl mb={5}>
              <FormLabel fontWeight="medium" color="gray.700">
                Límite de Usos
              </FormLabel>
              <NumberInput min={0} size="md">
                <NumberInputField
                  name="usoMaximo"
                  value={cuponEditando?.usoMaximo || ""}
                  onChange={handleInputChange}
                  placeholder="Usos ilimitados"
                  bg="gray.50"
                  borderColor="gray.300"
                  _hover={{ borderColor: "gray.400" }}
                  _focus={{ borderColor: "red.400", boxShadow: "0 0 0 1px var(--chakra-colors-red-400)" }}
                />
              </NumberInput>
            </FormControl>

            <FormControl
              display="flex"
              alignItems="center"
              p={4}
              bg="gray.50"
              borderRadius="md"
              borderWidth="1px"
              borderColor="gray.200"
            >
              <FormLabel htmlFor="activo" mb="0" fontWeight="medium" color="gray.700">
                ¿Cupón Activo?
              </FormLabel>
              <Switch
                id="activo"
                name="activo"
                isChecked={cuponEditando?.activo}
                onChange={handleInputChange}
                colorScheme="red"
                size="md"
              />
            </FormControl>
          </ModalBody>

          <ModalFooter
            borderTopWidth="1px"
            pt={4}
            pb={4}
            px={5}
            bg="gray.50"
            borderBottomRadius="lg"
            justifyContent="space-between"
          >
            <Button variant="outline" onClick={onClose} borderColor="gray.300" _hover={{ bg: "gray.100" }}>
              Cancelar
            </Button>
            <Button
              colorScheme="red"
              onClick={handleGuardarCupon}
              px={6}
              leftIcon={cuponEditando?.id ? <FiEdit /> : <FiPlus />}
              _hover={{ transform: "translateY(-1px)" }}
              transition="all 0.2s"
            >
              {cuponEditando?.id ? "Actualizar" : "Guardar"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}

export default GestionCupones

